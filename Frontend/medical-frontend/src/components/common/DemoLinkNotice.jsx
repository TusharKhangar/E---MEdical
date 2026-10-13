// src/components/common/DemoLinkNotice.jsx
// On the public demo the server has no mail account, so it returns the link it would have e-mailed.
// This shows that link with a short explanation.
import React from 'react';

const DemoLinkNotice = ({ link, title = 'Demo shortcut', children }) => {
  if (!link) return null;
  const path = (() => {
    try {
      const url = new URL(link);
      return url.pathname + url.search;
    } catch {
      return link;
    }
  })();
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold mb-1">{title}</p>
      <p className="mb-3">
        {children || 'This demo site does not send real e-mails. Use the link below, which is what the e-mail would contain.'}
      </p>
      <a href={path} className="inline-block rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700">
        Open the e-mailed link
      </a>
    </div>
  );
};

export default DemoLinkNotice;
