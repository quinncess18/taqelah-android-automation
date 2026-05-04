// @ts-check
const { defineConfig } = require('@playwright/test');
const { DEVICES } = require('./config/devices.config');

/**
 * Playwright Config: Universal Hybrid Infrastructure
 * Optimized for Local, GitHub Actions, and Cloud (BrowserStack/SauceLabs)
 */
module.exports = defineConfig({
  testDir: './tests/specs',
  fullyParallel: false, // Mobile tests usually require sequential execution per device
  forbidOnly: !!process.env.CI,
  retries: 0,
  /* Stop on first failure locally to save time */
  maxFailures: process.env.CI ? 0 : 1,
  
  /* 
   * DYNAMIC WORKER ENGINE 
   */
  workers: process.env.CI ? 1 : (process.env.WORKERS || DEVICES.length),

  reporter: [
    ['html'],
    ['list'],
    ['github'] // Enhanced output inside GHA UI
  ],

  use: {
    /* Base timeout for Appium commands */
    actionTimeout: 30000,
    trace: 'retain-on-failure',
    screenshot: 'on',
  },

  /* 
   * PROJECT MATRIX 
   * Dynamically maps our Device Registry to Playwright Projects.
   */
  projects: DEVICES.map((device) => ({
    name: device.name,
    use: { 
      deviceConfig: device,
      // Placeholder for Cloud Provider credentials
      isCloud: !!process.env.CLOUD_PROVIDER,
      cloudProvider: process.env.CLOUD_PROVIDER || 'local'
    },
    timeout: device.testTimeout || 180000,
  })),
});
