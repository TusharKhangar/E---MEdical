import fs from 'fs';
import { expect } from '@playwright/test';
import { ADMIN, APP_LOG } from '../playwright.config.js';

export { ADMIN };

/** Unique e-mail per test run, so tests never collide with each other or a previous run. */
export const uniqueEmail = (who) => `${who}.${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}@e2e.test`;

// Set once per run in playwright.config.js
export const STRONG_PASSWORD = process.env.E2E_PASSWORD;

/**
 * The newest link (with ?token=) e-mailed to this address. E-mail runs in log-only mode in tests, so the
 * message, link included, is in the app log. Sending is asynchronous, so this waits for it.
 */
export async function emailedLink(email, path) {
  let link;
  await expect.poll(() => {
    const log = fs.existsSync(APP_LOG) ? fs.readFileSync(APP_LOG, 'utf8') : '';
    const at = log.lastIndexOf(`[${email}]`);
    if (at < 0) return null;
    const match = log.slice(at).match(new RegExp(`https?://[^\\s]+${path}\\?token=[\\w-]+`));
    link = match?.[0];
    return link;
  }, { message: `e-mail to ${email} with a ${path} link`, timeout: 15_000 }).toBeTruthy();
  return new URL(link).pathname + new URL(link).search;
}

/** Signs in through the login form and waits for the dashboard. */
export async function signIn(page, email, password) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/dashboard/);
}

/** Token for API shortcuts in tests that are not about the UI step itself. */
export async function apiToken(request, email, password) {
  const r = await request.post('/api/login', { data: { username: email, password } });
  expect(r.ok(), `login ${email}`).toBeTruthy();
  return (await r.json()).jwt;
}

export const auth = (jwt) => ({ Authorization: `Bearer ${jwt}` });

/** Registers a patient through the API, confirms through the e-mailed link and sets a password. */
export async function createPatient(request, { first = 'Test', last = 'Patient' } = {}) {
  const email = uniqueEmail('patient');
  const r = await request.post('/api/register', {
    data: { email, firstName: first, lastName: last, phoneNumber: '9812345678', gender: 'FEMALE' },
  });
  expect(r.ok(), await r.text()).toBeTruthy();
  const token = new URLSearchParams((await emailedLink(email, '/confirm')).split('?')[1]).get('token');
  const set = await request.post('/api/confirmPassword', { data: { token, password: STRONG_PASSWORD } });
  expect(set.ok(), await set.text()).toBeTruthy();
  return { email, password: STRONG_PASSWORD, name: `${first} ${last}` };
}

/** Admin invites a doctor through the API; the doctor sets a password through the e-mailed link. */
export async function createDoctor(request, { first = 'Test', last = 'Doctor', specialization = 'Dermatology' } = {}) {
  const email = uniqueEmail('doctor');
  const jwt = await apiToken(request, ADMIN.email, ADMIN.password);
  const r = await request.post('/api/admin/doctors', {
    headers: auth(jwt),
    data: { email, firstName: first, lastName: last, phoneNumber: '9811122233', gender: 'MALE', specialization },
  });
  expect(r.status(), await r.text()).toBe(201);
  const token = new URLSearchParams((await emailedLink(email, '/set-password')).split('?')[1]).get('token');
  const set = await request.post('/api/confirmPassword', { data: { token, password: STRONG_PASSWORD } });
  expect(set.ok(), await set.text()).toBeTruthy();
  const id = (await r.json()).id;
  return { email, password: STRONG_PASSWORD, id, name: `Dr. ${first} ${last}` };
}

/** The next weekday at least `minDays` ahead, as yyyy-mm-dd. */
export function nextWeekday(minDays = 3) {
  const d = new Date();
  d.setDate(d.getDate() + minDays);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
