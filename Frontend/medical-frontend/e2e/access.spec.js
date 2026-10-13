// Who can open what, in the browser and at the API, including tampered and missing tokens.
import { test, expect } from '@playwright/test';
import { ADMIN, apiToken, auth, createDoctor, createPatient, signIn } from './helpers.js';

test('signed-out visitors are sent to sign in from every dashboard page', async ({ page }) => {
  for (const path of ['/dashboard', '/dashboard/appointments', '/dashboard/analytics', '/dashboard/make-appointment']) {
    await page.goto(path);
    await expect(page, path).toHaveURL(/\/login/);
  }
});

test('a patient cannot open admin or doctor pages', async ({ page, request }) => {
  const patient = await createPatient(request);
  await signIn(page, patient.email, patient.password);
  for (const path of ['/dashboard/analytics', '/dashboard/users', '/dashboard/add-doctor', '/dashboard/availability']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: /analytics|patients|add doctor|working hours/i }), path).toHaveCount(0);
  }
});

test('the API enforces roles for every protected area', async ({ request }) => {
  const patient = await createPatient(request);
  const p = auth(await apiToken(request, patient.email, patient.password));
  const a = auth(await apiToken(request, ADMIN.email, ADMIN.password));

  // No token
  for (const path of ['/api/profile', '/api/user/appointments', '/api/doctor/appointments', '/api/admin/stats']) {
    expect((await request.get(path)).status(), path).toBe(401);
  }
  // Wrong role
  expect((await request.get('/api/admin/stats', { headers: p })).status()).toBe(403);
  expect((await request.get('/api/doctor/schedule', { headers: p })).status()).toBe(403);
  expect((await request.get('/api/user/appointments', { headers: a })).status()).toBe(403);
  // Right role
  expect((await request.get('/api/user/appointments', { headers: p })).status()).toBe(200);
  expect((await request.get('/api/admin/stats', { headers: a })).status()).toBe(200);
});

test('tampered, foreign and malformed tokens are rejected', async ({ request }) => {
  const patient = await createPatient(request);
  const jwt = await apiToken(request, patient.email, patient.password);
  const [header, payload, signature] = jwt.split('.');

  // Same token with the role claim / subject swapped to the admin's e-mail, old signature kept
  const forged = JSON.parse(Buffer.from(payload, 'base64url').toString());
  forged.sub = ADMIN.email;
  const forgedToken = `${header}.${Buffer.from(JSON.stringify(forged)).toString('base64url')}.${signature}`;
  // "alg: none" with no signature
  const none = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from(JSON.stringify(forged)).toString('base64url')}.`;

  for (const [label, token] of [['forged subject', forgedToken], ['alg none', none], ['garbage', 'abc.def.ghi'], ['flipped signature', `${header}.${payload}.${signature.slice(0, -2)}xx`]]) {
    const r = await request.get('/api/admin/stats', { headers: auth(token) });
    expect([401, 403], label).toContain(r.status());
  }
});

test('a patient cannot read or change another patient\'s data', async ({ request }) => {
  const alice = await createPatient(request, { first: 'Alice' });
  const bob = await createPatient(request, { first: 'Bob' });
  const a = auth(await apiToken(request, alice.email, alice.password));
  const b = auth(await apiToken(request, bob.email, bob.password));

  const doctor = await createDoctor(request, { first: 'Isha', last: 'Kapoor' });
  const d = new Date(); d.setDate(d.getDate() + 10);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  const date = d.toISOString().slice(0, 10);
  const { slots } = await (await request.get(`/api/doctors/${doctor.id}/slots?date=${date}`)).json();
  const booked = await request.post('/api/user/appointments', { headers: a, data: { doctorId: doctor.id, date, time: slots.at(-1), description: 'private' } });
  expect(booked.status()).toBe(201);
  const id = (await booked.json()).id;

  expect((await request.patch(`/api/user/appointments/${id}/cancel`, { headers: b })).status()).toBe(404);
  expect([403, 404]).toContain((await request.get(`/api/appointments/${id}/prescription`, { headers: b })).status());
  const bobsList = await (await request.get('/api/user/appointments', { headers: b })).json();
  expect(bobsList.find((x) => x.id === id)).toBeUndefined();
});

test('security headers are sent and password hashes never leave the server', async ({ request }) => {
  const r = await request.get('/');
  expect(r.headers()['content-security-policy']).toContain("default-src 'self'");
  expect(r.headers()['x-content-type-options']).toBe('nosniff');
  expect(r.headers()['x-frame-options']).toBeTruthy();

  const a = auth(await apiToken(request, ADMIN.email, ADMIN.password));
  for (const path of ['/api/admin/accounts?role=USER', '/api/admin/accounts?role=ADMIN', '/api/profile', '/api/doctors']) {
    const body = await (await request.get(path, { headers: a })).text();
    expect(body, path).not.toMatch(/"password"|\$2[aby]\$/);
  }
});
