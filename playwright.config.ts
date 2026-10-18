import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  forbidOnly: !!process.env.CI,
  use: {
    baseURL: 'http://127.0.0.1:4322',
    launchOptions: { executablePath: process.env.CHROME_PATH },
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 } },
    { name: 'mobile', use: { viewport: { width: 375, height: 667 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } },
    { name: 'landscape', use: { viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    // The Vercel adapter can't `astro preview` on-demand routes, so serve the static output.
    command: 'pnpm exec serve .vercel/output/static --listen tcp://127.0.0.1:4322 --no-clipboard',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: !process.env.CI,
  },
});
