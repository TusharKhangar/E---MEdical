// src/components/dashboard/MessagesInbox.jsx
// Admin inbox for messages sent through the public Contact page.
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Reply, RotateCcw } from 'lucide-react';
import { Empty, PageTitle, Spinner } from './ui';
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

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl">
      <PageTitle title="Messages" subtitle={`From the Contact page · ${open.length} waiting for a reply`}>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
            checked={showHandled} onChange={(e) => setShowHandled(e.target.checked)} />
          Show handled
        </label>
      </PageTitle>

      {visible.length === 0 ? (
        <div className="card"><Empty>{messages.length === 0 ? 'No messages yet.' : 'All caught up.'}</Empty></div>
      ) : (
        <ul className="space-y-3">
          {visible.map((m) => (
            <li key={m.id} className={`card p-5 ${m.handled ? 'opacity-70' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">
                    {m.name} <span className="font-normal text-slate-600">· {m.email}</span>
                  </p>
                  <p className="text-xs text-slate-600">{m.subject || 'No subject'} · {m.createdAt?.replace('T', ' ').slice(0, 16)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || 'Your message'))}`} className="btn-secondary btn-sm">
                    <Reply className="h-3.5 w-3.5" aria-hidden="true" /> Reply
                  </a>
                  <button onClick={() => toggleHandled(m)} className="btn-ghost btn-sm">
                    {m.handled ? <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> : <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                    {m.handled ? 'Reopen' : 'Mark handled'}
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line break-words text-sm text-slate-700">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MessagesInbox;
