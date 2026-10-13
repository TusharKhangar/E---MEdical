// Previous / next pager for server-side pages ({ page, size, totalElements, totalPages }, page is 0-based).
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pager = ({ page, onPage }) => {
  if (!page || page.totalElements === 0) return null;
  const first = page.page * page.size + 1;
  const last = Math.min((page.page + 1) * page.size, page.totalElements);
  return (
    <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
      <span>
        {first}–{last} of {page.totalElements.toLocaleString()}
      </span>
      <div className="flex items-center gap-2">
        <button className="btn-secondary btn-sm px-2" onClick={() => onPage(page.page - 1)} disabled={page.page === 0} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="tabular-nums">
          Page {page.page + 1} of {Math.max(page.totalPages, 1)}
        </span>
        <button className="btn-secondary btn-sm px-2" onClick={() => onPage(page.page + 1)} disabled={page.page + 1 >= page.totalPages} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pager;
