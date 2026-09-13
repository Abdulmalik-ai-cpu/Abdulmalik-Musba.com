import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact-form';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <section className="section max-w-3xl">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Contact</h1>
      <p className="prose-portfolio mt-6">
        Have a question, a collaboration in mind, or just want to say hello? Fill out the form and I will get back to
        you.
      </p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </section>
  );
}