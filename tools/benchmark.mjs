// Throughput benchmark: hammers the busiest read endpoints of a LOCAL instance with concurrent clients and
// prints requests per second and p50 / p95 / p99 latency for each.
//
// Run it after tools/loadtest.mjs has filled the database (it signs in as the accounts that script creates):
//   node tools/benchmark.mjs http://localhost:8080
// Optional: SECONDS (per endpoint, default 15), CLIENTS (concurrent, default 16), OUT (write results as JSON).
// Never point it at a real deployment.
import fs from 'fs';

const U = process.argv[2] || 'http://localhost:8080';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@load.test';
const ADMIN_PW = process.env.ADMIN_PASSWORD || 'Load-Test-Admin-1!';
const PW = 'orange-kettle-maple-bridge-77';
const SECONDS = Number(process.env.SECONDS || 15);
const CLIENTS = Number(process.env.CLIENTS || 16);

const get = async (path, token) => {
  const t0 = performance.now();
  const r = await fetch(U + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  await r.arrayBuffer();
  return { status: r.status, ms: performance.now() - t0 };
};
const login = async (username, password) => {
  const r = await fetch(U + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
  if (r.status !== 200) throw new Error(`login ${username}: ${r.status}`);
  return (await r.json()).jwt;
};
const day = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];

const admin = await login(ADMIN_EMAIL, ADMIN_PW);
const doctors = await (await fetch(U + '/api/doctors')).json();
const doctorAccounts = (await (await fetch(U + '/api/admin/accounts?role=DOCTOR&size=10', { headers: { Authorization: `Bearer ${admin}` } })).json()).content;
const doctorTokens = await Promise.all(doctorAccounts.slice(0, 5).map((d) => login(d.email, PW)));
const patientTokens = await Promise.all([1, 2, 3, 4, 5].map((i) => login(`patient${i}@mail.test`, PW)));

let n = 0;
const next = (list) => list[n++ % list.length];
const scenarios = [
  ['public: free slots for a doctor', () => get(`/api/doctors/${next(doctors).id}/slots?date=${day(1 + (n % 60))}`)],
  ['patient: own appointments', () => get('/api/user/appointments', next(patientTokens))],
  ['doctor: own appointments', () => get('/api/doctor/appointments', next(doctorTokens))],
  ['admin: search pending, page 1', () => get('/api/admin/appointments/search?status=PENDING&size=20', admin)],
  ['admin: search by doctor and dates', () => get(`/api/admin/appointments/search?doctorId=${next(doctors).id}&from=${day(1)}&to=${day(14)}&size=20`, admin)],
  ['admin: analytics, last 30 days', () => get('/api/admin/analytics?days=30', admin)],
  ['admin: doctor accounts, page 1', () => get('/api/admin/accounts?role=DOCTOR&size=20', admin)],
];

console.log(`${CLIENTS} concurrent clients, ${SECONDS}s per endpoint\n`);
console.log(`${'endpoint'.padEnd(36)} ${'req/s'.padStart(7)} ${'p50'.padStart(7)} ${'p95'.padStart(7)} ${'p99'.padStart(7)}  errors`);
const results = [];
for (const [label, run] of scenarios) {
  for (let i = 0; i < CLIENTS; i++) await run(); // warm-up
  const times = [];
  let errors = 0;
  const end = performance.now() + SECONDS * 1000;
  const t0 = performance.now();
  await Promise.all(Array.from({ length: CLIENTS }, async () => {
    while (performance.now() < end) {
      const r = await run();
      if (r.status !== 200) errors++;
      times.push(r.ms);
    }
  }));
  const elapsed = (performance.now() - t0) / 1000;
  times.sort((a, b) => a - b);
  const row = { endpoint: label, rps: times.length / elapsed, p50: pct(times, 0.5), p95: pct(times, 0.95), p99: pct(times, 0.99), errors };
  results.push(row);
  console.log(`${label.padEnd(36)} ${row.rps.toFixed(0).padStart(7)} ${row.p50.toFixed(1).padStart(6)}ms ${row.p95.toFixed(1).padStart(6)}ms ${row.p99.toFixed(1).padStart(6)}ms  ${errors}`);
}
if (process.env.OUT) fs.writeFileSync(process.env.OUT, JSON.stringify(results, null, 2));
