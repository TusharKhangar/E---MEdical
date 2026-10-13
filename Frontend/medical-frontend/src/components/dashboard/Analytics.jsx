// src/components/dashboard/Analytics.jsx
// Admin analytics: bookings per day, status mix, departments, busiest hours and doctors.
// The numbers come from grouped HQL queries (GET /api/admin/analytics); the charts are plain SVG,
// so there is no charting library to download.
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { medicalService, errorMessage } from '../../services/medicalService';

const RANGES = [7, 30, 90];

const STATUS_COLOURS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444'
};

const shortDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

const Card = ({ title, subtitle, children, className = '' }) => (
  <section className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
    {children}
  </section>
);

/** Column chart of appointments per day, with past days solid, future days lighter, and a "today" line. */
const DailyChart = ({ days, today }) => {
  const width = 720;
  const height = 220;
  const pad = { top: 10, right: 8, bottom: 28, left: 32 };
  const max = Math.max(1, ...days.map((d) => d.count));
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const step = innerW / days.length;
  const barW = Math.max(2, step * 0.7);
  const ticks = [0, Math.round(max / 2), max].filter((v, i, a) => a.indexOf(v) === i);
  const labelEvery = Math.ceil(days.length / 8);
  const todayIndex = days.findIndex((d) => d.label === today);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img"
      aria-label={`Appointments per day, ${days.length} days`}>
      {ticks.map((t) => {
        const y = pad.top + innerH - (t / max) * innerH;
        return (
          <g key={t}>
            <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="#e5e7eb" />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#6b7280">{t}</text>
          </g>
        );
      })}
      {days.map((d, i) => {
        const h = (d.count / max) * innerH;
        const x = pad.left + i * step + (step - barW) / 2;
        const future = d.label > today;
        return (
          <g key={d.label}>
            <rect x={x} y={pad.top + innerH - h} width={barW} height={h} rx="2"
              fill={future ? '#93c5fd' : '#2563eb'}>
              <title>{`${shortDate(d.label)}: ${d.count} appointment${d.count === 1 ? '' : 's'}`}</title>
            </rect>
            {i % labelEvery === 0 && (
              <text x={x + barW / 2} y={height - 8} textAnchor="middle" fontSize="11" fill="#6b7280">
                {shortDate(d.label)}
              </text>
            )}
          </g>
        );
      })}
      {todayIndex >= 0 && (
        <g>
          <line x1={pad.left + (todayIndex + 0.5) * step} x2={pad.left + (todayIndex + 0.5) * step}
            y1={pad.top} y2={pad.top + innerH} stroke="#111827" strokeDasharray="4 3" />
          <text x={pad.left + (todayIndex + 0.5) * step + 4} y={pad.top + 10} fontSize="11" fill="#111827">today</text>
        </g>
      )}
    </svg>
  );
};

/** Donut of the status mix, with a legend. */
const StatusDonut = ({ statuses, total }) => {
  const r = 60;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-36 h-36 shrink-0" role="img" aria-label="Appointments by status">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#f3f4f6" strokeWidth="22" />
        {total > 0 && statuses.map((s) => {
          const len = (s.count / total) * c;
          const el = (
            <circle key={s.label} cx="80" cy="80" r={r} fill="none" stroke={STATUS_COLOURS[s.label]}
              strokeWidth="22" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
              transform="rotate(-90 80 80)">
              <title>{`${s.label}: ${s.count}`}</title>
            </circle>
          );
          offset += len;
          return el;
        })}
        <text x="80" y="78" textAnchor="middle" fontSize="24" fontWeight="700" fill="#111827">{total}</text>
        <text x="80" y="98" textAnchor="middle" fontSize="11" fill="#6b7280">appointments</text>
      </svg>
      <ul className="space-y-2 text-sm">
        {statuses.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: STATUS_COLOURS[s.label] }} />
            <span className="text-gray-700 w-24">{s.label.charAt(0) + s.label.slice(1).toLowerCase()}</span>
            <span className="font-medium text-gray-900">{s.count}</span>
            <span className="text-gray-400">{total ? `${Math.round((s.count / total) * 100)}%` : ''}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Horizontal bars, largest first. */
const Bars = ({ rows, colour = 'bg-blue-600', empty = 'No data yet.' }) => {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0) return <p className="text-sm text-gray-500">{empty}</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 truncate pr-2">{r.label}</span>
            <span className="font-medium text-gray-900">{r.count}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full">
            <div className={`h-2 rounded-full ${colour}`} style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

const Analytics = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    medicalService.getAnalytics(days)
      .then(setData)
      .catch((error) => toast.error(errorMessage(error, 'Could not load analytics')))
      .finally(() => setLoading(false));
  }, [days]);

  const busiestHour = data?.perTime?.reduce((best, t) => (t.count > (best?.count ?? -1) ? t : best), null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center">
          <ChartBarIcon className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">By visit date: the last {days} days and the next two weeks already booked</p>
          </div>
        </div>
        <div className="flex gap-2" role="group" aria-label="Range">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setDays(r)} aria-pressed={days === r}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                days === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {r} days
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : data && (
        <div className={`space-y-6 ${loading ? 'opacity-60' : ''}`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Appointments', value: data.total.toLocaleString() },
              { label: 'Completion rate', value: `${data.completionRate}%`, note: 'of finished visits' },
              { label: 'Cancellation rate', value: `${data.cancellationRate}%`, note: 'of all appointments' },
              { label: 'Busiest time', value: busiestHour && busiestHour.count > 0 ? busiestHour.label : '—' }
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p className="text-sm text-gray-500">{k.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{k.value}</p>
                {k.note && <p className="text-xs text-gray-400">{k.note}</p>}
              </div>
            ))}
          </div>

          <Card title="Appointments per day" subtitle="Dark bars are past days, light bars are already booked ahead">
            <DailyChart days={data.perDay} today={data.today} />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Status" subtitle="Where every appointment in the range stands">
              <StatusDonut statuses={data.perStatus} total={data.total} />
            </Card>
            <Card title="Departments" subtitle="Appointments per department">
              <Bars rows={data.perDepartment} />
            </Card>
            <Card title="Time of day" subtitle="Which slots fill up first">
              <Bars rows={data.perTime} colour="bg-teal-500" />
            </Card>
            <Card title="Busiest doctors" subtitle="Top five by appointments">
              {data.topDoctors.length === 0 ? (
                <p className="text-sm text-gray-500">No data yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="pb-2 font-medium">Doctor</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                      <th className="pb-2 font-medium text-right">Completed</th>
                      <th className="pb-2 font-medium text-right">Cancelled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.topDoctors.map((d) => (
                      <tr key={d.doctorId}>
                        <td className="py-2 text-gray-900">{d.doctorName}</td>
                        <td className="py-2 text-right font-medium">{d.appointments}</td>
                        <td className="py-2 text-right text-green-700">{d.completed}</td>
                        <td className="py-2 text-right text-red-600">{d.cancelled}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
