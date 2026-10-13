// Centered dialog over a dimmed page. Escape or the backdrop closes it; focus moves into it on open.
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const Modal = ({ title, subtitle, onClose, children, footer, size = 'max-w-lg', as: Tag = 'div', onSubmit, labelId }) => {
  const panel = useRef(null);
  const id = labelId || 'modal-title';

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    panel.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby={id}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <Tag ref={panel} tabIndex={-1} onSubmit={onSubmit}
        className={`flex max-h-[92vh] w-full ${size} flex-col rounded-t-2xl bg-white shadow-pop outline-none sm:rounded-2xl`}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="min-w-0">
            <h2 id={id} className="text-base font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="btn-ghost -mr-2 px-2" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div>}
      </Tag>
    </div>
  );
};

export default Modal;
