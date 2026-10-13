// Sign-up, e-mail confirmation, sign-in, sign-out and password reset, all through the UI.
import { test, expect } from '@playwright/test';
import { emailedLink, signIn, uniqueEmail, STRONG_PASSWORD, createPatient } from './helpers.js';

test('a new patient signs up, confirms by e-mail, sets a password and signs in', async ({ page }) => {
  const email = uniqueEmail('signup');

  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill('Meera');
  await page.locator('input[name="lastName"]').fill('Iyer');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="phoneNumber"]').fill('9812345678');
  await page.locator('select[name="gender"]').selectOption('FEMALE');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/login/);

  // Can't sign in before confirming
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(STRONG_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText(/confirm your e-mail/i).first()).toBeVisible();

  // The e-mailed link confirms the address and leads to choosing a password
  await page.goto(await emailedLink(email, '/confirm'));
  await expect(page).toHaveURL(/\/set-password\?token=/, { timeout: 15_000 });
  await page.locator('input[name="password"]').fill('weak');
  await page.locator('input[name="confirmPassword"]').fill('weak');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/set-password/); // refused, still here

  await page.locator('input[name="password"]').fill(STRONG_PASSWORD);
  await page.locator('input[name="confirmPassword"]').fill(STRONG_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

  await signIn(page, email, STRONG_PASSWORD);
  await expect(page.getByText('Meera').first()).toBeVisible();
});

test('signing up twice with the same e-mail is refused', async ({ page, request }) => {
  const patient = await createPatient(request);
  await page.goto('/register');
  await page.locator('input[name="firstName"]').fill('Again');
  await page.locator('input[name="lastName"]').fill('Person');
  await page.locator('input[name="email"]').fill(patient.email);
  await page.locator('input[name="phoneNumber"]').fill('9812345678');
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText(/already/i).first()).toBeVisible();
  await expect(page).toHaveURL(/\/register/);
});

test('a wrong password is refused and the session survives a reload until sign-out', async ({ page, request }) => {
  const patient = await createPatient(request);

  await page.goto('/login');
  await page.locator('input[name="email"]').fill(patient.email);
  await page.locator('input[name="password"]').fill('Not-The-Password-1');
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText(/invalid email or password/i).first()).toBeVisible();
  await expect(page).toHaveURL(/\/login/);

  await signIn(page, patient.email, patient.password);
  await page.reload();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole('button', { name: /sign out|log ?out/i }).first().click();
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});

test('a forgotten password is reset through the e-mailed link', async ({ page, request }) => {
  const patient = await createPatient(request);
  const newPassword = `${STRONG_PASSWORD}-changed`;

  await page.goto('/forgot-password');
  await page.locator('input[name="email"]').fill(patient.email);
  await page.locator('button[type="submit"]').click();

  await page.goto(await emailedLink(patient.email, '/reset-password'));
  await page.locator('input[name="password"]').fill(newPassword);
  await page.locator('input[name="confirmPassword"]').fill(newPassword);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

  await signIn(page, patient.email, newPassword);
});
