// A plain table for one page of rows, with the pager underneath. Searching, filtering and paging
// happen before (in the API, or in pageOf for short lists), so this only draws what it's given.
import React from 'react';
import Pager from './Pager';

const ServerTable = ({ page, columns, onPage, loading, empty = 'Nothing found.' }) => (
  <div className="relative">
    {loading && (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60" aria-label="Loading">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
      </div>
    )}
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-y border-slate-100 bg-slate-50/70">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={`whitespace-nowrap px-5 py-2.5 text-left text-xs font-medium text-slate-600 ${c.className || ''}`}>
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {page?.content?.length ? (
            page.content.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60">
                {columns.map((c) => (
                  <td key={c.key} className={`whitespace-nowrap px-5 py-3 text-slate-700 ${c.className || ''}`}>
                    {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '–')}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-600">{loading ? '' : empty}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    <Pager page={page} onPage={onPage} />
  </div>
);

export default ServerTable;
