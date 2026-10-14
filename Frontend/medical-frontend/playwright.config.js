// End-to-end browser tests against the real app: the Spring Boot jar (which serves the built React UI)
// on an in-memory database, with e-mail in log-only mode so tests can read the links from the log.
//
//   cd bioMedical && ./mvnw -DskipTests package    (after copying the Vite build into resources/static)
//   cd Frontend/medical-frontend && npm run e2e
//
// E2E_BASE_URL=https://... runs the read-only smoke tests against a deployed site instead.
import { defineConfig, devices } from '@playwright/test';

const PORT = 8099;
const external = process.env.E2E_BASE_URL;
export const ADMIN = { email: 'admin@e2e.test', password: 'E2e-Admin-Pass-2026!' };
export const APP_LOG = 'e2e/.app.log';

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'e2e/.results',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never', outputFolder: 'e2e/.report' }]] : 'list',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: external || `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...(process.env.E2E_CHROME ? { launchOptions: { executablePath: process.env.E2E_CHROME } } : {}),
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /mobile\.spec/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile\.spec/ },
  ],
  webServer: external ? undefined : {
    command: `java -jar ${process.env.E2E_JAR || '../../bioMedical/target/bioMedical.jar'}`,
    url: `http://localhost:${PORT}/actuator/health`,
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      PORT: String(PORT),
      FRONTEND_URL: `http://localhost:${PORT}`,
      CORS_ALLOWED_ORIGINS: `http://localhost:${PORT}`,
      DB_URL: 'jdbc:h2:mem:e2e;MODE=MySQL;DB_CLOSE_DELAY=-1;NON_KEYWORDS=USER,DATE,TIME,VALUE',
      DB_USERNAME: 'sa',
      DB_PASSWORD: '',
      JWT_SECRET: 'ZTJlLW9ubHktc2lnbmluZy1rZXktbm90LWEtcmVhbC1zZWNyZXQtMDEyMzQ1Njc4OQ==',
      ADMIN_EMAIL: ADMIN.email,
      ADMIN_PASSWORD: ADMIN.password,
      MAIL_USERNAME: '',
      MAIL_PASSWORD: '',
      BREVO_API_KEY: '',
      REMINDERS_ENABLED: 'false',
      LOGGING_FILE_NAME: APP_LOG,
    },
  },
});
