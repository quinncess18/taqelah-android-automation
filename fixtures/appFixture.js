const { test: base } = require('@playwright/test');
const { remote } = require('webdriverio');
const { APPIUM_SERVER, APK_PATH, IPA_PATH, DEVICES } = require('../config/devices.config');

/**
 * appFixture — creates one WebdriverIO Appium session per Playwright worker.
 * Supports both Android (UIAutomator2) and iOS (XCUITest).
 */
const test = base.extend({
  driver: [
    async ({}, use, workerInfo) => {
      const device = workerInfo.project.use.deviceConfig || DEVICES[0];
      const isAndroid = device.platform === 'android';

      console.log(`[appFixture] Initializing ${device.platform.toUpperCase()} on ${device.name} (${device.udid})`);

      const commonCaps = {
        'appium:deviceName': device.name,
        'appium:udid': device.udid,
        'appium:noReset': true,
        'appium:fullReset': false,
        'appium:newCommandTimeout': 300,
      };

      const androidCaps = {
        platformName: 'Android',
        'appium:automationName': 'UIAutomator2',
        'appium:systemPort': device.systemPort,
        'appium:chromeDriverPort': device.chromeDriverPort,
        'appium:appPackage': 'com.taqelah.demo_app',
        'appium:appActivity': '.MainActivity',
        'appium:autoGrantPermissions': true,
        ...(APK_PATH ? { 'appium:app': APK_PATH } : {}),
      };

      const iosCaps = {
        platformName: 'iOS',
        'appium:automationName': 'XCUITest',
        'appium:wdaLocalPort': device.wdaLocalPort,
        'appium:bundleId': 'com.taqelah.demoApp', // Typical Flutter iOS bundle
        ...(IPA_PATH ? { 'appium:app': IPA_PATH } : {}),
      };

      const capabilities = {
        ...commonCaps,
        ...(isAndroid ? androidCaps : iosCaps),
      };

      const driver = await remote({
        ...APPIUM_SERVER,
        capabilities,
        logLevel: 'warn',
      });

      // Android-specific: Detect gesture navigation
      let hasGestureNav = false;
      if (isAndroid) {
        try {
          const navMode = await driver.execute('mobile: shell', {
            command: 'settings',
            args: ['get', 'secure', 'navigation_mode'],
          });
          hasGestureNav = String(navMode).trim() === '2';
        } catch {}
      }

      driver._deviceProfile = {
        name: device.name,
        scrollPercent: device.scrollPercent,
        settlePause: device.settlePause,
        hasGestureNav,
      };

      // --- SELF-HEALING LOGIC ---
      const testDir = workerInfo.project.testDir || '';
      const isAuthModule = testDir.includes('01_auth');
      const navMenuSelector = isAndroid 
        ? 'android=new UiSelector().description("Open navigation menu")' 
        : '~Open navigation menu';
      
      const navMenu = await driver.$(navMenuSelector);
      
      if (isAuthModule && await navMenu.isDisplayed()) {
        console.log(`[appFixture] Resetting ${device.name} to Login screen...`);
        if (isAndroid) {
          await driver.execute('mobile: shell', { command: 'pm', args: ['clear', 'com.taqelah.demo_app'] });
          await driver.execute('mobile: startActivity', { intent: 'com.taqelah.demo_app/com.taqelah.demo_app.MainActivity' });
        } else {
          // iOS alternative: clear storage usually requires re-install or app-specific reset
          await driver.terminateApp('com.taqelah.demoApp');
          await driver.activateApp('com.taqelah.demoApp');
        }
        await driver.pause(2000);
      }

      await use(driver);

      await driver.deleteSession().catch((err) => {
        console.warn(`[appFixture] deleteSession warning: ${err.message}`);
      });
    },
    { scope: 'worker' },
  ],
});

const { expect } = base;
module.exports = { test, expect };
