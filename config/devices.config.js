// @ts-check
/**
 * Central device configuration for the Taqelah Android/iOS Automation framework.
 *
 * All values can be overridden via environment variables — no code changes needed
 * for CI/CD pipelines or when switching to different hardware.
 */

const path = require('path');
const fs = require('fs');

// ---------------------------------------------------------------------------
// Appium server — single Appium 2.x instance
// ---------------------------------------------------------------------------
const APPIUM_SERVER = {
  protocol: 'http',
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT || '4723', 10),
  path: '/',
};

// ---------------------------------------------------------------------------
// App paths — defaults relative to project root
// ---------------------------------------------------------------------------
const _defaultApkPath = path.resolve(__dirname, '..', 'apps', 'DemoApp-v1.0.0.apk');
const _defaultIpaPath = path.resolve(__dirname, '..', 'apps', 'DemoApp-v1.0.0.app'); // iOS Simulator uses .app

const APK_PATH = process.env.ANDROID_APP_PATH || (fs.existsSync(_defaultApkPath) ? _defaultApkPath : null);
const IPA_PATH = process.env.IOS_APP_PATH || (fs.existsSync(_defaultIpaPath) ? _defaultIpaPath : null);

// ---------------------------------------------------------------------------
// Device registry (Dynamically scales via Environment Variables for CI)
// ---------------------------------------------------------------------------
const _allDevices = [];
let hasEnvDevices = false;

// Check for up to 10 devices defined via environment variables
for (let i = 0; i < 10; i++) {
  if (process.env[`DEVICE_${i}_UDID`]) {
    hasEnvDevices = true;
    _allDevices.push({
      name: process.env[`DEVICE_${i}_NAME`] || `Device ${i}`,
      platform: (process.env[`DEVICE_${i}_PLATFORM`] || 'android').toLowerCase(),
      udid: process.env[`DEVICE_${i}_UDID`],
      systemPort: parseInt(process.env[`DEVICE_${i}_SYSTEM_PORT`] || String(8200 + i), 10),
      chromeDriverPort: parseInt(process.env[`DEVICE_${i}_CHROMEDRIVER_PORT`] || String(9515 + i), 10),
      wdaLocalPort: parseInt(process.env[`DEVICE_${i}_WDA_PORT`] || String(8100 + i), 10), // iOS Specific
      testTimeout: parseInt(process.env[`DEVICE_${i}_TIMEOUT`] || '180000', 10),
      scrollPercent: parseFloat(process.env[`DEVICE_${i}_SCROLL_PERCENT`] || '0.10'),
      settlePause: parseInt(process.env[`DEVICE_${i}_SETTLE_PAUSE`] || '800', 10),
    });
  }
}

// Fallback for local testing if no environment variables are set
if (!hasEnvDevices) {
  _allDevices.push(
    {
      name: 'Pixel 8 (Local)',
      platform: 'android',
      udid: 'emulator-5554',
      systemPort: 8200,
      chromeDriverPort: 9515,
      testTimeout: 180000,
      scrollPercent: 0.10,
      settlePause: 800,
    }
  );
}

const _deviceCount = process.env.DEVICE_COUNT
  ? parseInt(process.env.DEVICE_COUNT, 10)
  : _allDevices.length;

const DEVICES = _allDevices.slice(0, _deviceCount);

module.exports = { APPIUM_SERVER, APK_PATH, IPA_PATH, DEVICES };
