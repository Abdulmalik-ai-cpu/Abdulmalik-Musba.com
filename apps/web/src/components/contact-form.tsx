'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { api } from '@/lib/api';
import { Button, Input, Label, Textarea } from '@portfolio/ui';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Sending…' : 'Send message'}
    </Button>
  );
}

export function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setState('sending');
    try {
      await api.contact.submit({
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        subject: String(formData.get('subject') ?? '') || null,
        message: String(formData.get('message') ?? ''),
        website: String(formData.get('website') ?? ''), // honeypot, human users never see this field
      });
      setState('success');
      setMessage('Thank you! Your message has been sent.');
      form.reset();
    } catch {
      setState('error');
      setMessage('Something went wrong. Please try again, or email me directly.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate={false}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required minLength={1} maxLength={200} autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" maxLength={300} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required minLength={1} maxLength={5000} rows={8} />
      </div>

      {/* Honeypot — hidden from humans, bots fill it. */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state !== 'idle' && <p className="text-sm text-ink/70">{message}</p>}

      <SubmitButton />
    </form>
  );
}