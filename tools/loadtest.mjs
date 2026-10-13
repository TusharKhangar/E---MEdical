// Realistic-data load test: fills a LOCAL E-Medical instance through its public API (the same paths real
// users take), then measures every read endpoint and runs concurrency checks.
//
// Start the app with e-mail in log-only mode and a log file, so the e-mailed links can be read back:
//   ADMIN_EMAIL=admin@load.test ADMIN_PASSWORD=Load-Test-Admin-1! LOGGING_FILE_NAME=load.log java -jar bioMedical.jar
//   APP_LOG=load.log node tools/loadtest.mjs http://localhost:8080
// Never point it at a real deployment: it creates thousands of accounts.
import fs from 'fs';

const U = process.argv[2] || 'http://localhost:8080';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@load.test';
const PW = process.env.ADMIN_PASSWORD || 'Load-Test-Admin-1!';
const APP_LOG = process.env.APP_LOG || 'load.log';
const NEW_PW = 'orange-kettle-maple-bridge-77';
const DOCTORS = Number(process.env.DOCTORS || 120);
const PATIENTS = Number(process.env.PATIENTS || 1500);
const BOOKINGS = Number(process.env.BOOKINGS || 6000);

const FIRST = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Kavya', 'Isha', 'Meera', 'Riya', 'Priya', 'Neha', 'Rahul', 'Rohan', 'Karan', 'Vikram', 'Sneha', 'Pooja', 'Divya', 'Nikhil', 'Siddharth', 'Tanvi'];
const LAST = ['Sharma', 'Verma', 'Iyer', 'Nair', 'Reddy', 'Patel', 'Gupta', 'Singh', 'Rao', 'Menon', 'Das', 'Kapoor', 'Joshi', 'Mehta', 'Chopra', 'Bose', 'Kulkarni', 'Pillai', 'Shetty', 'Agarwal'];
const SPECS = ['Cardiology', 'Dermatology', 'ENT', 'General Medicine', 'Gynecology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Ophthalmology', 'Psychiatry'];
const REASONS = ['Fever and body ache for three days', 'Follow-up on blood pressure', 'Persistent cough', 'Skin rash on arms', 'Knee pain after running', 'Child vaccination', 'Migraine episodes', 'Annual health check-up', 'Ear pain', 'Blurred vision', 'Anxiety and poor sleep', 'Back pain', 'Prenatal check-up', ''];
const SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

let seed = 42;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (a) => a[Math.floor(rnd() * a.length)];

const stats = {};
const note = (k) => (stats[k] = (stats[k] || 0) + 1);

async function call(method, path, { token, body, text } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = text ? 'text/plain' : 'application/json';
  const t0 = performance.now();
  const r = await fetch(U + path, { method, headers, body: body === undefined ? undefined : text ? body : JSON.stringify(body) });
  const raw = await r.text();
  let json; try { json = JSON.parse(raw); } catch { /* plain text */ }
  return { status: r.status, json, raw, ms: performance.now() - t0, bytes: raw.length };
}
const login = async (email, password = PW) => {
  const r = await call('POST', '/api/login', { body: { username: email, password } });
  if (r.status !== 200) throw new Error(`login ${email}: ${r.status} ${r.raw}`);
  return r.json;
};
async function pool(items, size, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) { const idx = i++; await fn(items[idx], idx); }
  }));
}
/** The token from the newest e-mail to this address in the app log (sending is async, so wait a little). */
async function emailedToken(email) {
  for (let i = 0; i < 100; i++) {
    const log = fs.existsSync(APP_LOG) ? fs.readFileSync(APP_LOG, 'utf8') : '';
    const at = log.lastIndexOf(`[${email}]`);
    const m = at >= 0 && log.slice(at).match(/\?token=([\w-]+)/);
    if (m) return m[1];
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`no e-mail to ${email} in ${APP_LOG}`);
}
const day = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };

const t0 = performance.now();
const admin = await login(ADMIN_EMAIL);

// ---- Doctors: invited by the admin, set their own password from the invite link
const doctorEmails = [];
await pool([...Array(DOCTORS).keys()], 8, async (i) => {
  const email = `dr${i}.${pick(LAST).toLowerCase()}@hospital.test`;
  const r = await call('POST', '/api/admin/doctors', { token: admin.jwt, body: { email, firstName: pick(FIRST), lastName: pick(LAST), gender: pick(['MALE', 'FEMALE']), specialization: SPECS[i % SPECS.length], phoneNumber: String(9000000000 + i) } });
  if (r.status !== 201) { note(`invite ${r.status}`); return; }
  const s = await call('POST', '/api/confirmPassword', { body: { token: await emailedToken(email), password: NEW_PW } });
  note(`doctor setPassword ${s.status}`);
  if (s.status === 200) doctorEmails.push(email);
});
console.log(`doctors ready: ${doctorEmails.length}`);

// ---- Patients: self-register, confirm and choose a password
const patients = [];
await pool([...Array(PATIENTS).keys()], 12, async (i) => {
  const email = `patient${i}@mail.test`;
  const r = await call('POST', '/api/register', { body: { email, firstName: pick(FIRST), lastName: pick(LAST), gender: pick(['MALE', 'FEMALE', 'OTHER']), phoneNumber: String(8000000000 + i) } });
  if (r.status !== 200) { note(`register ${r.status}`); return; }
  const token = await emailedToken(email);
  const c = await call('GET', `/api/confirm?token=${token}`);
  if (c.status !== 200) note(`confirm ${c.status}`);
  const s = await call('POST', '/api/confirmPassword', { body: { token, password: NEW_PW } });
  if (s.status === 200) patients.push(email); else note(`patient setPassword ${s.status}`);
});
console.log(`patients ready: ${patients.length} (${((performance.now() - t0) / 1000).toFixed(0)}s)`);

// ---- Bookings
const doctors = (await call('GET', '/api/doctors')).json;
const patientTokens = new Map();
const tokenFor = async (email) => {
  if (!patientTokens.has(email)) patientTokens.set(email, (await login(email, NEW_PW)).jwt);
  return patientTokens.get(email);
};
const bookingLatency = [];
await pool([...Array(BOOKINGS).keys()], 12, async () => {
  const email = pick(patients);
  const r = await call('POST', '/api/user/appointments', { token: await tokenFor(email), body: { doctorId: pick(doctors).id, date: day(1 + Math.floor(rnd() * 60)), time: pick(SLOTS), description: pick(REASONS) } });
  bookingLatency.push(r.ms);
  note(`book ${r.status}`);
});

// ---- Staff work the queue: doctors confirm and complete some of their appointments
await pool(doctorEmails.slice(0, 40), 6, async (email) => {
  const t = (await login(email, NEW_PW)).jwt;
  const mine = (await call('GET', '/api/doctor/appointments', { token: t })).json || [];
  for (const a of mine.slice(0, 15)) {
    const r = await call('PATCH', `/api/doctor/appointments/${a.id}/status`, { token: t, body: { status: rnd() < 0.15 ? 'CANCELLED' : 'CONFIRMED' } });
    note(`doctor status ${r.status}`);
  }
});
console.log(`data loaded in ${((performance.now() - t0) / 1000).toFixed(0)}s`);

// ---- Concurrency: 20 different patients grab the same slot at once
const raceDoctor = doctors[0].id;
const raceDay = day(75);
const racers = patients.slice(0, 20);
const tokens = await Promise.all(racers.map(tokenFor));
const race = await Promise.all(tokens.map((t) => call('POST', '/api/user/appointments', { token: t, body: { doctorId: raceDoctor, date: raceDay, time: '10:00' } })));
const raceWins = race.filter((r) => r.status === 201).length;
console.log(`RACE same slot, 20 concurrent patients: ${raceWins} booked (should be 1), statuses ${[...new Set(race.map((r) => r.status))]}`);

// Same patient double-clicking Book on two doctors at the same time
const solo = tokens[0];
const dbl = await Promise.all(doctors.slice(1, 6).map((d) => call('POST', '/api/user/appointments', { token: solo, body: { doctorId: d.id, date: day(80), time: '11:00' } })));
console.log(`RACE one patient, 5 doctors same time: ${dbl.filter((r) => r.status === 201).length} booked (should be 1)`);

// ---- Read endpoints at this size
const measure = async (label, method, path, token, n = 5) => {
  const runs = [];
  let last;
  for (let i = 0; i < n; i++) { last = await call(method, path, { token }); runs.push(last.ms); }
  runs.sort((a, b) => a - b);
  console.log(`${label.padEnd(44)} ${last.status}  median ${runs[Math.floor(n / 2)].toFixed(0).padStart(5)} ms  ${(last.bytes / 1024).toFixed(0).padStart(5)} KB  ${Array.isArray(last.json) ? last.json.length + ' rows' : ''}`);
};
const somePatient = await tokenFor(patients[1]);
const someDoctor = (await login(doctorEmails[0], NEW_PW)).jwt;
console.log('\n== Read endpoints with', BOOKINGS, 'bookings');
await measure('admin: all appointments', 'GET', '/api/admin/appointments', admin.jwt);
await measure('admin: patients list', 'GET', '/api/admin/users', admin.jwt);
await measure('admin: doctors list', 'GET', '/api/admin/doctors', admin.jwt);
await measure('admin: stats', 'GET', '/api/admin/stats', admin.jwt);
await measure('admin: appointment search page', 'GET', '/api/admin/appointments/search?q=sharma&status=PENDING&size=20', admin.jwt);
await measure('admin: account search page', 'GET', '/api/admin/accounts?role=USER&q=priya&size=20', admin.jwt);
await measure('admin: analytics 90 days', 'GET', '/api/admin/analytics?days=90', admin.jwt);
await measure('public: doctors directory', 'GET', '/api/doctors', null);
await measure('public: home stats', 'GET', '/api/stats', null);
await measure('public: free slots', 'GET', `/api/doctors/${doctors[3].id}/slots?date=${day(5)}`, null);
await measure('doctor: own appointments', 'GET', '/api/doctor/appointments', someDoctor);
await measure('patient: own appointments', 'GET', '/api/user/appointments', somePatient);
await measure('patient: profile', 'GET', '/api/profile', somePatient);

bookingLatency.sort((a, b) => a - b);
console.log(`\nbooking latency: median ${bookingLatency[Math.floor(bookingLatency.length / 2)].toFixed(0)} ms, p95 ${bookingLatency[Math.floor(bookingLatency.length * 0.95)].toFixed(0)} ms`);
console.log('outcomes:', JSON.stringify(stats));
