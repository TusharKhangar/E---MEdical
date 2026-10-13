import React, { useState } from 'react';
import { Clock, MessageSquare, Phone } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import toast from 'react-hot-toast';
import api from '../services/api';
import { errorMessage } from '../services/medicalService';

const EMPTY = { firstName: '', lastName: '', email: '', subject: 'General Inquiry', message: '' };

const inputClass = 'input';

const Contact = () => {
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const response = await api.post('/contact', {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        subject: form.subject,
        message: form.message
      });
      toast.success(response.data);
      setSentTo(form.email);
      setForm(EMPTY);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not send your message. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        eyebrow="Contact"
        title="Talk to the clinic"
        subtitle="Questions about appointments, records or billing? Send a message and the clinic team will reply by e-mail."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <aside className="space-y-4">
          {[
            { Icon: Clock, title: 'Appointment hours', lines: ['Each doctor sets their own hours.', 'Most work 9:00 to 18:00 on weekdays.'] },
            { Icon: MessageSquare, title: 'Replies', lines: ['By e-mail, usually within one working day.'] },
            { Icon: Phone, title: 'Emergencies', lines: ['Don’t use this form. Call 112.'] },
          ].map(({ Icon, title, lines }) => (
            <div key={title} className="card flex gap-4 p-5">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" strokeWidth={1.75} aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                {lines.map((line) => <p key={line} className="mt-1 text-sm text-slate-600">{line}</p>)}
              </div>
            </div>
          ))}
        </aside>

        <section className="card p-6 sm:p-8" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className="text-lg font-semibold text-slate-900">Send a message</h2>
          {sentTo && (
            <div role="status" className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
              Message received. We&apos;ll reply to {sentTo}.
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="label">First name</label>
                <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required maxLength={60} autoComplete="given-name" className={inputClass} />
              </div>
              <div>
                <label htmlFor="lastName" className="label">Last name</label>
                <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} maxLength={60} autoComplete="family-name" className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="label">E-mail</label>
              <input id="email" type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" className={inputClass} />
            </div>
            <div>
              <label htmlFor="subject" className="label">Subject</label>
              <select id="subject" name="subject" value={form.subject} onChange={handleChange} className={inputClass}>
                <option>General Inquiry</option>
                <option>Appointment Request</option>
                <option>Medical Records</option>
                <option>Insurance Question</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="label">Message</label>
              <textarea id="message" name="message" value={form.message} onChange={handleChange} required rows="5" maxLength={2000} className={inputClass} />
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full py-2.5">
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Contact;
