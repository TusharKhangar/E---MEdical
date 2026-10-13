// src/components/dashboard/MessagesInbox.jsx
// Admin inbox for messages sent through the public Contact page.
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { medicalService, errorMessage } from '../../services/medicalService';

const MessagesInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHandled, setShowHandled] = useState(false);

  useEffect(() => {
    medicalService.getMessages()
      .then(setMessages)
      .catch((error) => toast.error(errorMessage(error, 'Could not load messages')))
      .finally(() => setLoading(false));
  }, []);

  const toggleHandled = async (message) => {
    try {
      const updated = await medicalService.setMessageHandled(message.id, !message.handled);
      setMessages((prev) => prev.map((m) => (m.id === message.id ? updated : m)));
    } catch (error) {
      toast.error(errorMessage(error, 'Could not update the message'));
    }
  };

  const open = messages.filter((m) => !m.handled);
  const visible = showHandled ? messages : open;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <EnvelopeIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">From the Contact page · {open.length} waiting for a reply</p>
            </div>
          </div>
          <label className="flex items-center text-sm text-gray-600">
            <input type="checkbox" className="mr-2" checked={showHandled} onChange={(e) => setShowHandled(e.target.checked)} />
            Show handled messages
          </label>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500">
          {messages.length === 0 ? 'No messages yet.' : 'All caught up.'}
        </div>
      ) : (
        <ul className="space-y-4">
          {visible.map((m) => (
            <li key={m.id} className={`bg-white rounded-xl border p-6 ${m.handled ? 'border-gray-100 opacity-70' : 'border-blue-100'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">
                    {m.name} <span className="font-normal text-gray-500">&lt;{m.email}&gt;</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {m.subject || 'No subject'} · {m.createdAt?.replace('T', ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || 'Your message'))}`}
                    className="px-3 py-1 text-sm rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    Reply
                  </a>
                  <button
                    onClick={() => toggleHandled(m)}
                    className="flex items-center px-3 py-1 text-sm rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    {m.handled ? 'Reopen' : 'Mark handled'}
                  </button>
                </div>
              </div>
              <p className="mt-4 text-gray-700 whitespace-pre-line break-words">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MessagesInbox;
