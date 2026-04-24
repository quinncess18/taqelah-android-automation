// @ts-check
const { execSync } = require('child_process');
const { DEVICES } = require('./config/devices.config');

/**
 * globalSetup — runs once before all tests.
 * This ensures every device starts with a clean app state (logged out).
 */
async function globalSetup() {
  console.log('\n[Global Setup] Clearing app data for CI readiness...');

  for (const device of DEVICES) {
    try {
      console.log(`[Global Setup] Resetting ${device.name} (${device.udid})...`);
      // pm clear kills the process and wipes all local storage/session
      execSync(`adb -s ${device.udid} shell pm clear com.taqelah.demo_app`);
    } catch (err) {
      console.warn(`[Global Setup] Warning: Could not clear data on ${device.udid}. Ensure device is connected.`);
    }
  }
  
  console.log('[Global Setup] Environment ready.\n');
}

module.exports = globalSetup;
