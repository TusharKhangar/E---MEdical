// Title block used at the top of public pages.
import React from 'react';

const PageHeader = ({ eyebrow, title, subtitle, children }) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div className="max-w-2xl">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 text-slate-600">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default PageHeader;
