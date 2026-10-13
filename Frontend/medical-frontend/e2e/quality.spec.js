// Accessibility (axe), console errors and broken requests on every public page, plus the sign-in page.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ADMIN, createDoctor, createPatient, signIn } from './helpers.js';

const PUBLIC_PAGES = ['/', '/about', '/departments', '/doctors', '/contact', '/login', '/register', '/forgot-password'];

for (const path of PUBLIC_PAGES) {
  test(`${path} has no serious accessibility problems, console errors or failed requests`, async ({ page }) => {
    const problems = [];
    page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
    page.on('response', (r) => r.status() >= 400 && problems.push(`${r.status()} ${r.url()}`));

    await page.goto(path, { waitUntil: 'networkidle' });
    expect(problems).toEqual([]);

    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id}: ${v.help} (${v.nodes.length}) e.g. ${v.nodes[0]?.target?.join(' ')}`);
    expect(serious, `${path}: ${serious.join(' | ')}`).toEqual([]);
  });
}

const seriousIssues = async (page) => {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.help} (${v.nodes.length}) e.g. ${v.nodes[0]?.target?.join(' ')}`);
};

test('signed-in pages for each role have no serious accessibility problems', async ({ page, request }) => {
  const patient = await createPatient(request);
  const doctor = await createDoctor(request);
  const pages = [
    [patient, ['/dashboard', '/dashboard/appointments', '/dashboard/make-appointment', '/dashboard/my-profile']],
    [doctor, ['/dashboard', '/dashboard/appointments', '/dashboard/availability']],
    [ADMIN, ['/dashboard', '/dashboard/analytics', '/dashboard/appointments', '/dashboard/users', '/dashboard/add-doctor', '/dashboard/messages']],
  ];
  const found = [];
  for (const [who, paths] of pages) {
    await signIn(page, who.email, who.password);
    for (const path of paths) {
      await page.goto(path, { waitUntil: 'networkidle' });
      (await seriousIssues(page)).forEach((issue) => found.push(`${who.email.split('@')[0]} ${path}: ${issue}`));
    }
    await page.evaluate(() => localStorage.clear());
  }
  expect(found, found.join(' | ')).toEqual([]);
});

test('the contact form sends a message', async ({ page }) => {
  await page.goto('/contact');
  await page.locator('input[name="firstName"]').fill('Ravi Kumar');
  await page.locator('input[name="email"]').fill('ravi.kumar@e2e.test');
  await page.locator('textarea[name="message"]').fill('Do you have weekend hours for paediatrics?');
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText(/thank|sent|received/i).first()).toBeVisible();
});

test('an unknown page shows the app, not a server error', async ({ page }) => {
  const r = await page.goto('/this-page-does-not-exist');
  expect(r.status()).toBeLessThan(500);
});
