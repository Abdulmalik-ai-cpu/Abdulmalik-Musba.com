import { Injectable, Logger } from '@nestjs/common';
import { loadApiConfig } from '@portfolio/config';
import nodemailer, { type Transporter } from 'nodemailer';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

export interface EmailResult {
  /** True only when the provider accepted the message for delivery. */
  accepted: boolean;
  provider: string;
  id?: string;
  error?: string;
}

export interface EmailAdapter {
  send(message: EmailMessage): Promise<EmailResult>;
}

/**
 * Console adapter for development. It logs instead of sending and never
 * claims delivery, so no one mistakes a dev run for a real notification
 * (§117, §131).
 */
class ConsoleEmailAdapter implements EmailAdapter {
  private readonly logger = new Logger('Email:console');

  async send(message: EmailMessage): Promise<EmailResult> {
    this.logger.log(`[console] to=${message.to} subject=${message.subject}`);
    return { accepted: true, provider: 'console' };
  }
}

/** Resend adapter. Delivery is only reported as accepted, never "delivered". */
class ResendEmailAdapter implements EmailAdapter {
  private readonly logger = new Logger('Email:resend');

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          reply_to: message.replyTo,
        }),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        this.logger.warn(`Resend rejected the message (${response.status}): ${detail}`);
        return { accepted: false, provider: 'resend', error: `HTTP ${response.status}` };
      }

      const data = (await response.json().catch(() => ({}))) as { id?: string };
      return { accepted: true, provider: 'resend', id: data.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(`Resend request failed: ${message}`);
      return { accepted: false, provider: 'resend', error: message };
    }
  }
}

/**
 * SMTP adapter. Points at a real mail server in production and at a local
 * capture service such as Mailpit in development (§140.42, §143.26).
 * A mail server's 250 response means "accepted", never "delivered", so that is
 * all this reports (§131).
 */
class SmtpEmailAdapter implements EmailAdapter {
  private readonly logger = new Logger('Email:smtp');
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(options: {
    host: string;
    port: number;
    secure: boolean;
    user?: string;
    password?: string;
    from: string;
  }) {
    this.from = options.from;
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure,
      auth: options.user ? { user: options.user, pass: options.password } : undefined,
    });
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        replyTo: message.replyTo,
      });
      return { accepted: true, provider: 'smtp', id: info.messageId };
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(`SMTP send failed: ${detail}`);
      return { accepted: false, provider: 'smtp', error: detail };
    }
  }
}

/**
 * Provider-neutral email service (ADR-008).
 * A provider outage returns `accepted: false` and never throws into the
 * caller's request path, so a failed notification cannot fail a contact
 * submission (§143.41).
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly adapter: EmailAdapter | null;

  constructor() {
    const config = loadApiConfig();
    if (config.emailProvider === 'resend' && config.resendApiKey && config.contactFromEmail) {
      this.adapter = new ResendEmailAdapter(config.resendApiKey, config.contactFromEmail);
    } else if (config.emailProvider === 'smtp' && config.smtpHost && config.contactFromEmail) {
      this.adapter = new SmtpEmailAdapter({
        host: config.smtpHost,
        port: config.smtpPort ?? 587,
        secure: config.smtpSecure,
        user: config.smtpUser,
        password: config.smtpPassword,
        from: config.contactFromEmail,
      });
    } else if (config.emailProvider === 'console') {
      this.adapter = new ConsoleEmailAdapter();
    } else {
      this.adapter = null;
    }
  }

  isConfigured(): boolean {
    return this.adapter !== null;
  }

  providerName(): string {
    if (!this.adapter) return 'none';
    if (this.adapter instanceof ResendEmailAdapter) return 'resend';
    if (this.adapter instanceof SmtpEmailAdapter) return 'smtp';
    return 'console';
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    if (!this.adapter) {
      return { accepted: false, provider: 'none', error: 'No email provider configured' };
    }
    return this.adapter.send(message);
  }
}
