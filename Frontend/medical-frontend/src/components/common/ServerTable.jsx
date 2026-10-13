// A plain table for one server-side page of rows, with the pager underneath.
// Searching, filtering and paging happen in the API, so this only draws what it is given.
import React from 'react';
import Pager from './Pager';

const ServerTable = ({ page, columns, onPage, loading, empty = 'Nothing found.' }) => (
  <div className="relative">
    {loading && (
      <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10" aria-label="Loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )}
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {page?.content?.length ? (
            page.content.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                {loading ? '' : empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    <Pager page={page} onPage={onPage} />
  </div>
);

export default ServerTable;
