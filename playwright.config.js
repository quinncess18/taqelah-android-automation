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
  retries: process.env.CI ? 2 : 1,
  
  /* 
   * DYNAMIC WORKER ENGINE 
   * GitHub Actions: 1 worker per runner to ensure emulator stability.
   * Local/Cloud: Scalable based on device count.
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
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
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
