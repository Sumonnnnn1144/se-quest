import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  outputDir: 'test-results',
  use: { baseURL: 'http://localhost:5173', channel: 'chrome' },
  webServer: { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true },
  projects: [
    { name: 'mobile-dark', use: { viewport: { width: 390, height: 844 }, colorScheme: 'dark', hasTouch: true } },
    { name: 'mobile-light', use: { viewport: { width: 390, height: 844 }, colorScheme: 'light', hasTouch: true } },
    { name: 'desktop-dark', use: { viewport: { width: 1280, height: 860 }, colorScheme: 'dark' } },
    { name: 'desktop-light', use: { viewport: { width: 1280, height: 860 }, colorScheme: 'light' } },
  ],
});
