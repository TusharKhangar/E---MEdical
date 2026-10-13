import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { errorMessage } from '../services/medicalService';

const EMPTY = { firstName: '', lastName: '', email: '', subject: 'General Inquiry', message: '' };

const inputClass = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800';

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Questions about appointments, records or billing? Send us a message and our team will reply by e-mail.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get In Touch</h2>
              <div className="space-y-6">
                {[
                  { icon: '📍', title: 'Address', lines: ['123 Medical Street, Health City, HC 12345'] },
                  { icon: '📞', title: 'Phone', lines: ['+1 (555) 123-4567', 'Emergency: +1 (555) 911-0000'] },
                  { icon: '✉️', title: 'Email', lines: ['info@remedic.com'] },
                  { icon: '⏰', title: 'Clinic hours', lines: ['Appointments: 9:00 to 17:00 (closed 13:00 to 14:00)', 'Emergency: 24/7'] }
                ].map((item) => (
                  <div key={item.title} className="flex items-start">
                    <div className="text-2xl mr-4">{item.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      {item.lines.map((line) => (
                        <p key={line} className="text-gray-600">{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            {sentTo && (
              <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                Message received. We&apos;ll reply to {sentTo}.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required maxLength={60} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} maxLength={60} className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input id="email" type="email" name="email" value={form.email} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select id="subject" name="subject" value={form.subject} onChange={handleChange} className={inputClass}>
                  <option>General Inquiry</option>
                  <option>Appointment Request</option>
                  <option>Medical Records</option>
                  <option>Insurance Question</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea id="message" name="message" value={form.message} onChange={handleChange} required rows="5" maxLength={2000} className={inputClass} />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
