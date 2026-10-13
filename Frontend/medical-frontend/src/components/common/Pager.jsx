// Previous / next pager for server-side pages ({ page, size, totalElements, totalPages }, page is 0-based).
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pager = ({ page, onPage }) => {
  if (!page || page.totalElements === 0) return null;
  const first = page.page * page.size + 1;
  const last = Math.min((page.page + 1) * page.size, page.totalElements);
  const button = 'p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40';
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-600">
      <span>
        {first}–{last} of {page.totalElements.toLocaleString()}
      </span>
      <div className="flex items-center gap-2">
        <button className={button} onClick={() => onPage(page.page - 1)} disabled={page.page === 0} aria-label="Previous page">
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <span>
          Page {page.page + 1} of {Math.max(page.totalPages, 1)}
        </span>
        <button className={button} onClick={() => onPage(page.page + 1)} disabled={page.page + 1 >= page.totalPages} aria-label="Next page">
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pager;
