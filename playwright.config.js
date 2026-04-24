// @ts-check
const { defineConfig } = require('@playwright/test');
const { DEVICES } = require('./config/devices.config');

/**
 * Playwright config for Taqelah Android Automation.
 */
module.exports = defineConfig({
  testDir: __dirname + '/tests/specs',
  testMatch: '**/*.spec.js',

  timeout: 120000,      // 120 s per test - Flutter apps can be slow to boot
  expect: {
    timeout: 20000,     // 20 s for assertions
  },

  // Run tests in parallel across all available workers.
  // Each worker owns one Appium session on one physical device.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: DEVICES.length,

  reporter: [
    ['list'],
    ['html', { open: 'on-failure', outputFolder: 'playwright-report' }],
  ],

  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: DEVICES.map((device) => ({
    name: device.name,
    use: { deviceConfig: device },
    timeout: device.testTimeout,
  })),
});
