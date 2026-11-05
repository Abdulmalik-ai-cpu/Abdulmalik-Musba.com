import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { loadApiConfig } from '@portfolio/config';

export interface ContactInput {
  name: string;
  email: string;
  organization?: string | null;
  subject?: string | null;
  message: string;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Contact submission workflow (§43, §143.36).
 * The database record is the authoritative record of the submission. A
 * notification is attempted after it is persisted, and a failure is recorded
 * on the submission rather than failing the request (§143.41).
 */
@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  async submit(input: ContactInput) {
    const submission = await this.prisma.contactSubmission.create({
      data: {
        name: input.name,
        email: input.email,
        organization: input.organization ?? null,
        subject: input.subject ?? null,
        message: input.message,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
      },
    });

    await this.notify(submission.id, input);
    return { id: submission.id, received: true };
  }

  private async notify(submissionId: string, input: ContactInput) {
    const config = loadApiConfig();
    const recipient = config.contactToEmail;
    if (!recipient || !this.email.isConfigured()) {
      await this.prisma.contactSubmission.update({
        where: { id: submissionId },
        data: { notificationError: 'No recipient or email provider configured' },
      });
      return;
    }

    const result = await this.email.send({
      to: recipient,
      subject: `New contact: ${input.subject ?? input.name}`,
      replyTo: input.email,
      text: [
        `From: ${input.name} <${input.email}>`,
        input.organization ? `Organization: ${input.organization}` : null,
        input.subject ? `Subject: ${input.subject}` : null,
        '',
        input.message,
      ]
        .filter((line): line is string => line !== null)
        .join('\n'),
    });

    await this.prisma.contactSubmission.update({
      where: { id: submissionId },
      data: {
        notifiedAt: result.accepted ? new Date() : null,
        notificationError: result.accepted ? null : (result.error ?? 'Notification failed'),
      },
    });

    if (!result.accepted) {
      this.logger.warn(`Contact notification not accepted (${result.provider}): ${result.error}`);
    }
  }
}
