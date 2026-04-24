const { test: base } = require('@playwright/test');
const { remote } = require('webdriverio');
const { APPIUM_SERVER, APK_PATH, DEVICES } = require('../config/devices.config');

/**
 * appFixture — creates one WebdriverIO Appium session per Playwright worker
 * and tears it down after all tests in that worker finish.
 *
 * Device assignment:
 *   Each project in playwright.config.js sets `use: { deviceConfig: DEVICES[n] }`.
 *   Playwright routes tests from the same project to the same worker, so each
 *   device gets exactly one persistent Appium session for the duration of the run.
 *
 * Usage:
 *   const { test } = require('../../fixtures/appFixture');
 *   test('my test', async ({ driver }) => { ... });
 */
const test = base.extend({
  /**
   * driver — worker-scoped: one Appium session for all tests on this worker's device.
   *
   * Device is read from workerInfo.project.use.deviceConfig — set per project in
   * playwright.config.js. Falls back to DEVICES[0] for direct file runs without
   * a project config (e.g. npx playwright test path/to/spec.js).
   */
  driver: [
    async ({}, use, workerInfo) => {
      // Prioritize deviceConfig from playwright.config.js project settings
      const device = workerInfo.project.use.deviceConfig || DEVICES[0];

      console.log(`[appFixture] ${device.name} (${device.udid})`);

      const capabilities = {
        platformName: 'Android',
        'appium:automationName': 'UIAutomator2',
        'appium:deviceName': device.name,
        'appium:udid': device.udid,
        'appium:systemPort': device.systemPort,
        'appium:chromeDriverPort': device.chromeDriverPort,
        'appium:appPackage': 'com.taqelah.demo_app', // Corrected package name
        'appium:appActivity': '.MainActivity',       // Typical Flutter launcher activity
        'appium:noReset': true,
        'appium:fullReset': false,
        'appium:newCommandTimeout': 300,
        'appium:autoGrantPermissions': true,
        ...(APK_PATH ? { 'appium:app': APK_PATH } : {}),
      };

      const driver = await remote({
        ...APPIUM_SERVER,
        capabilities,
        logLevel: 'warn',
      });

      // Detect gesture navigation mode
      let hasGestureNav = false;
      try {
        const navMode = await driver.execute('mobile: shell', {
          command: 'settings',
          args: ['get', 'secure', 'navigation_mode'],
        });
        hasGestureNav = String(navMode).trim() === '2';
      } catch {
        // Fallback for older Android or restricted shell
      }

      // Attach device profile to driver
      driver._deviceProfile = {
        name: device.name,
        scrollPercent: device.scrollPercent,
        settlePause:   device.settlePause,
        hasGestureNav,
      };

      console.log(
        `[appFixture] ${device.name} (${device.udid}) — ` +
        `gesture nav: ${hasGestureNav}, ` +
        `scrollPercent: ${device.scrollPercent}, ` +
        `settlePause: ${device.settlePause}ms`
      );

      // --- SELF-HEALING LOGIC ---
      // Only perform a reset if we are in the Auth module and are already logged in.
      const testDir = workerInfo.project.testDir || '';
      const isAuthModule = testDir.includes('01_auth');
      
      const navMenuSelector = 'android=new UiSelector().description("Open navigation menu")';
      const navMenu = await driver.$(navMenuSelector);
      
      if (isAuthModule && await navMenu.isDisplayed()) {
        console.log(`[appFixture] ${device.name} is logged in during Auth suite. Resetting to Login screen...`);
        await driver.execute('mobile: shell', {
          command: 'pm',
          args: ['clear', 'com.taqelah.demo_app']
        });
        await driver.execute('mobile: startActivity', {
          intent: 'com.taqelah.demo_app/com.taqelah.demo_app.MainActivity'
        });
        await driver.pause(2000);
      }
      // --------------------------

      await use(driver);

      // Teardown
      await driver.deleteSession().catch((err) => {
        console.warn(`[appFixture] deleteSession warning (${device.name}): ${err.message}`);
      });
    },
    { scope: 'worker' },
  ],
});

const { expect } = base;

module.exports = { test, expect };
