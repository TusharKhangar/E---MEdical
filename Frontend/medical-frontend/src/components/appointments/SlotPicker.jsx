// Free times as a grid of buttons, morning and afternoon apart. Used for booking and rescheduling.
import React from 'react';

const SlotPicker = ({ slots, value, onChange, loading, emptyText = 'No free times that day. Try another date.' }) => {
  if (loading) return <p className="text-sm text-slate-600">Loading free times…</p>;
  if (!slots.length) return <p className="text-sm text-slate-600">{emptyText}</p>;

  const groups = [
    ['Morning', slots.filter((s) => s < '12:00')],
    ['Afternoon', slots.filter((s) => s >= '12:00')],
  ].filter(([, list]) => list.length);

  return (
    <div className="space-y-3" role="group" aria-label="Free times">
      {groups.map(([label, list]) => (
        <div key={label}>
          <p className="mb-1.5 text-xs font-medium text-slate-600">{label}</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {list.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => onChange(s)}
                aria-pressed={value === s}
                className={`rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${
                  value === s
                    ? 'border-brand-700 bg-brand-700 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:bg-brand-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SlotPicker;
