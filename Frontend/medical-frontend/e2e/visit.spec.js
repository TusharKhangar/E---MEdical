// The whole visit through the UI: admin invites a doctor, the doctor sets hours, a patient books and
// reschedules, the doctor confirms and writes a prescription, the patient downloads it as a PDF.
import { test, expect } from '@playwright/test';
import { ADMIN, emailedLink, signIn, uniqueEmail, STRONG_PASSWORD, createPatient, nextWeekday } from './helpers.js';

test.describe.configure({ mode: 'serial' });

const doctor = { email: uniqueEmail('dr'), first: 'Kabir', last: 'Malhotra' };
let patient;
const day = nextWeekday(4);

test('admin invites a doctor, who sets a password through the e-mailed link', async ({ page }) => {
  await signIn(page, ADMIN.email, ADMIN.password);
  await page.goto('/dashboard/add-doctor');
  await page.locator('input[name="firstName"]').fill(doctor.first);
  await page.locator('input[name="lastName"]').fill(doctor.last);
  await page.locator('input[name="email"]').fill(doctor.email);
  await page.locator('input[name="phoneNumber"]').fill('9811122233');
  await page.locator('select[name="specialization"]').selectOption('Dermatology');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/dashboard\/doctor-details/);
  await expect(page.getByText(doctor.email)).toBeVisible();

  await page.getByRole('button', { name: /sign out|log ?out/i }).first().click();
  await page.goto(await emailedLink(doctor.email, '/set-password'));
  await page.locator('input[name="password"]').fill(STRONG_PASSWORD);
  await page.locator('input[name="confirmPassword"]').fill(STRONG_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  await signIn(page, doctor.email, STRONG_PASSWORD);
});

test('the doctor works mornings only and the public slots follow', async ({ page, request }) => {
  await signIn(page, doctor.email, STRONG_PASSWORD);
  await page.goto('/dashboard/availability');
  const weekday = new Date(`${day}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' });
  await page.getByLabel(`${weekday} end`).selectOption('12:00');
  await page.getByRole('button', { name: /save/i }).click();
  await expect(page.getByText(/saved/i).first()).toBeVisible();

  const doctors = await (await request.get('/api/doctors')).json();
  const me = doctors.find((d) => d.firstName === doctor.first && d.lastName === doctor.last);
  doctor.id = me.id;
  const { slots } = await (await request.get(`/api/doctors/${me.id}/slots?date=${day}`)).json();
  expect(slots).toEqual(['09:00', '10:00', '11:00']);
});

test('a patient books, then moves the appointment to another time', async ({ page, request }) => {
  patient = await createPatient(request, { first: 'Anika', last: 'Rao' });
  await signIn(page, patient.email, patient.password);

  await page.goto('/dashboard/make-appointment');
  await page.locator('select[name="department"]').selectOption('Dermatology');
  await page.getByText(`Dr. ${doctor.first} ${doctor.last}`).click();
  await page.locator('input[name="date"]').fill(day);
  await page.getByRole('group', { name: 'Free times' }).getByRole('button', { name: '09:00' }).click();
  await page.locator('textarea[name="message"]').fill('Itchy rash on both arms');
  await page.getByRole('button', { name: /book appointment/i }).click();
  await expect(page).toHaveURL(/\/dashboard\/appointments/);
  await expect(page.getByRole('cell', { name: 'Itchy rash on both arms' })).toBeVisible();

  await page.getByTitle('Reschedule').first().click();
  await page.locator('#new-date').fill(day);
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: '11:00' }).click();
  await dialog.getByRole('button', { name: 'Move appointment' }).click();
  await expect(page.getByRole('cell', { name: '11:00' })).toBeVisible();
});

test('the doctor confirms, completes the visit and writes a prescription', async ({ page }) => {
  await signIn(page, doctor.email, STRONG_PASSWORD);
  await page.goto('/dashboard/appointments');
  await expect(page.getByRole('cell', { name: patient.name })).toBeVisible();
  await page.getByTitle('Confirm').first().click();
  await expect(page.getByText(/confirmed/i).first()).toBeVisible();

  await page.getByTitle(/complete visit/i).first().click();
  await page.locator('#rx-diagnosis').fill('Contact dermatitis');
  await page.getByLabel('Medicine name').first().fill('Cetirizine');
  await page.getByLabel('Dosage').first().fill('10 mg');
  await page.getByLabel('How often').first().fill('Once at night');
  await page.getByLabel('Days').first().fill('7');
  await page.locator('#rx-notes').fill('Avoid the new detergent.');
  await page.getByRole('dialog').getByRole('button', { name: 'Complete visit' }).click();
  await expect(page.getByText(/completed/i).first()).toBeVisible();
});

test('the patient reads the prescription and downloads the PDF', async ({ page }) => {
  await signIn(page, patient.email, patient.password);
  await page.goto('/dashboard/appointments');
  await page.getByRole('tab', { name: /completed/i }).click();
  await page.getByTitle('View prescription').first().click();
  await expect(page.getByText('Contact dermatitis')).toBeVisible();
  await expect(page.getByText('Cetirizine')).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('dialog').getByRole('button', { name: /download pdf/i }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
});

test('admin finds the visit in search and sees it in analytics', async ({ page }) => {
  await signIn(page, ADMIN.email, ADMIN.password);
  await page.goto('/dashboard/appointments');
  await page.getByPlaceholder(/patient, e-mail, doctor/i).fill(patient.email);
  await expect(page.getByRole('cell', { name: patient.email })).toBeVisible();
  await expect(page.getByText('1 matching')).toBeVisible();

  await page.goto('/dashboard/analytics');
  await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();
  await expect(page.getByText('Dermatology').first()).toBeVisible();
  await expect(page.getByText(`Dr. ${doctor.first} ${doctor.last}`)).toBeVisible();
});
