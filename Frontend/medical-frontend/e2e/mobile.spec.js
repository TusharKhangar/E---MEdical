// Phone layout: nothing wider than the screen, and the menus open.
import { test, expect } from '@playwright/test';
import { createPatient, signIn } from './helpers.js';

const noSideScroll = async (page, label) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, `${label} is wider than the screen by ${overflow}px`).toBeLessThanOrEqual(1);
};

for (const path of ['/', '/doctors', '/departments', '/about', '/contact', '/login', '/register']) {
  test(`${path} fits a phone screen`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    await noSideScroll(page, path);
  });
}

test('the dashboard and booking form fit a phone, and the menu opens', async ({ page, request }) => {
  const patient = await createPatient(request);
  await signIn(page, patient.email, patient.password);
  for (const path of ['/dashboard', '/dashboard/appointments', '/dashboard/make-appointment', '/dashboard/my-profile']) {
    await page.goto(path, { waitUntil: 'networkidle' });
    await noSideScroll(page, path);
  }
  await page.getByRole('button', { name: /menu/i }).first().click();
  await expect(page.getByRole('link', { name: /my appointments/i }).first()).toBeVisible();
});
