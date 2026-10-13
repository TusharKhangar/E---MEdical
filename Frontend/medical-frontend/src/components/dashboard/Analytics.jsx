// src/components/dashboard/Analytics.jsx
// Admin analytics: bookings per day, status mix, departments, busiest hours and doctors.
// The numbers come from grouped HQL queries (GET /api/admin/analytics); the charts are plain SVG,
// so there is no charting library to download.
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { medicalService, errorMessage } from '../../services/medicalService';
import { PageTitle, Spinner } from './ui';

const RANGES = [7, 30, 90];

const STATUS_COLOURS = {
  PENDING: '#d97706',
  CONFIRMED: '#0284c7',
  COMPLETED: '#059669',
  CANCELLED: '#94a3b8'
};

const shortDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

const Card = ({ title, subtitle, children, className = '' }) => (
  <section className={`card p-5 ${className}`}>
    <h2 className="card-title">{title}</h2>
    {subtitle && <p className="mb-4 mt-0.5 text-xs text-slate-600">{subtitle}</p>}
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
            <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="#e2e8f0" />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">{t}</text>
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
              fill={future ? '#b3ddd7' : '#226d66'}>
              <title>{`${shortDate(d.label)}: ${d.count} appointment${d.count === 1 ? '' : 's'}`}</title>
            </rect>
            {i % labelEvery === 0 && (
              <text x={x + barW / 2} y={height - 8} textAnchor="middle" fontSize="11" fill="#64748b">
                {shortDate(d.label)}
              </text>
            )}
          </g>
        );
      })}
      {todayIndex >= 0 && (
        <g>
          <line x1={pad.left + (todayIndex + 0.5) * step} x2={pad.left + (todayIndex + 0.5) * step}
            y1={pad.top} y2={pad.top + innerH} stroke="#0f172a" strokeDasharray="4 3" />
          <text x={pad.left + (todayIndex + 0.5) * step + 4} y={pad.top + 10} fontSize="11" fill="#0f172a">today</text>
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
        <circle cx="80" cy="80" r={r} fill="none" stroke="#f1f5f9" strokeWidth="22" />
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
        <text x="80" y="78" textAnchor="middle" fontSize="24" fontWeight="700" fill="#0f172a">{total}</text>
        <text x="80" y="98" textAnchor="middle" fontSize="11" fill="#64748b">appointments</text>
      </svg>
      <ul className="space-y-2 text-sm">
        {statuses.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: STATUS_COLOURS[s.label] }} />
            <span className="w-24 text-slate-700">{s.label.charAt(0) + s.label.slice(1).toLowerCase()}</span>
            <span className="font-medium text-slate-900">{s.count}</span>
            <span className="text-slate-600">{total ? `${Math.round((s.count / total) * 100)}%` : ''}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Horizontal bars, largest first. */
const Bars = ({ rows, colour = 'bg-brand-600', empty = 'No data yet.' }) => {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0) return <p className="text-sm text-slate-600">{empty}</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="truncate pr-2 text-slate-700">{r.label}</span>
            <span className="font-medium text-slate-900">{r.count}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100">
            <div className={`h-1.5 rounded-full ${colour}`} style={{ width: `${(r.count / max) * 100}%` }} />
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
      <PageTitle title="Analytics" subtitle={`By visit date: the last ${days} days and the next two weeks already booked`}>
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5" role="group" aria-label="Range">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setDays(r)} aria-pressed={days === r}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${days === r ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              {r} days
            </button>
          ))}
        </div>
      </PageTitle>

      {loading && !data ? (
        <Spinner />
      ) : data && (
        <div className={`space-y-6 ${loading ? 'opacity-60' : ''}`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Appointments', value: data.total.toLocaleString() },
              { label: 'Completion rate', value: `${data.completionRate}%`, note: 'of finished visits' },
              { label: 'Cancellation rate', value: `${data.cancellationRate}%`, note: 'of all appointments' },
              { label: 'Busiest time', value: busiestHour && busiestHour.count > 0 ? busiestHour.label : '—' }
            ].map((k) => (
              <div key={k.label} className="card p-5">
                <p className="text-sm font-medium text-slate-600">{k.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{k.value}</p>
                {k.note && <p className="mt-1 text-xs text-slate-600">{k.note}</p>}
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
              <Bars rows={data.perTime} colour="bg-slate-500" />
            </Card>
            <Card title="Busiest doctors" subtitle="Top five by appointments">
              {data.topDoctors.length === 0 ? (
                <p className="text-sm text-slate-600">No data yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-600">
                      <th className="pb-2 font-medium">Doctor</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                      <th className="pb-2 font-medium text-right">Completed</th>
                      <th className="pb-2 font-medium text-right">Cancelled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.topDoctors.map((d) => (
                      <tr key={d.doctorId}>
                        <td className="py-2 text-slate-900">{d.doctorName}</td>
                        <td className="py-2 text-right font-medium">{d.appointments}</td>
                        <td className="py-2 text-right text-emerald-700">{d.completed}</td>
                        <td className="py-2 text-right text-slate-600">{d.cancelled}</td>
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
