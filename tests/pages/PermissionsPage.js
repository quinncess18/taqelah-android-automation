// @ts-check
const { BasePage } = require('./BasePage');

/**
 * PermissionsPage — POM for the Permissions module.
 * Covers: Camera, Location, Storage permission requests with native OS dialog handling.
 * Expanded: Separate acceptWhileUsing/acceptOneTime/denyPermission methods,
 *           "Open Settings" detection, Storage Info field extraction.
 */
class PermissionsPage extends BasePage {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    super(driver);

    // ── Page Elements ──
    this.title = this.isAndroid
      ? 'android=new UiSelector().description("Permissions")'
      : '~Permissions';

    this.description = this.isAndroid
      ? 'android=new UiSelector().description("Request system permissions and observe their status. These trigger native OS dialogs that can be tested with Appium.")'
      : '~permissions-description';

    // ── Permission Entries (content-desc = "Camera\nNot checked") ──
    this.cameraEntry = this.isAndroid
      ? 'android=new UiSelector().descriptionStartsWith("Camera")'
      : '~Camera-entry';

    this.locationEntry = this.isAndroid
      ? 'android=new UiSelector().descriptionStartsWith("Location")'
      : '~Location-entry';

    this.storageEntry = this.isAndroid
      ? 'android=new UiSelector().descriptionStartsWith("Storage")'
      : '~Storage-entry';

    // ── Request Buttons (all have the same content-desc; differentiated by instance) ──
    this.cameraRequestBtn = this.isAndroid
      ? 'android=new UiSelector().description("Request").instance(0)'
      : '~camera-request';

    this.locationRequestBtn = this.isAndroid
      ? 'android=new UiSelector().description("Request").instance(1)'
      : '~location-request';

    this.storageRequestBtn = this.isAndroid
      ? 'android=new UiSelector().description("Request").instance(2)'
      : '~storage-request';

    // ── "Open Settings" button (appears when permission is "Permanently Denied") ──
    this.openSettingsBtn = this.isAndroid
      ? 'android=new UiSelector().description("Open Settings")'
      : '~open-settings';

    // ── Storage Info section ──
    this.storageInfoEntry = this.isAndroid
      ? 'android=new UiSelector().descriptionStartsWith("Storage Info")'
      : '~storage-info';

    // ── Native OS Permission Dialog (Android PermissionController) ──
    // API 30+ — "While using the app" button
    this.allowWhileUsingBtn = this.isAndroid
      ? 'android=new UiSelector().resourceId("com.android.permissioncontroller:id/permission_allow_foreground_only_button")'
      : '~While using the app';

    // API 30+ — "Only this time" button
    this.allowOneTimeBtn = this.isAndroid
      ? 'android=new UiSelector().resourceId("com.android.permissioncontroller:id/permission_allow_one_time_button")'
      : '~Only this time';

    // API 29 fallback ("Allow" / "Allow all the time") — used when the specific
    // accept-option buttons don't exist (pre-Android 11 permission dialogs).
    this.allowGenericBtn = this.isAndroid
      ? 'android=new UiSelector().resourceId("com.android.permissioncontroller:id/permission_allow_button")'
      : '~Allow';

    // On 1st deny: `permission_deny_button`
    // On 2nd deny ("Denied" → "Permanently Denied"): `permission_deny_and_dont_ask_again_button`
    this.denyBtn = this.isAndroid
      ? 'android=new UiSelector().resourceIdMatches(".*permission_deny.*")'
      : "~Don't allow";
  }

  /**
   * Wait for the Permissions page to load.
   */
  async waitForPageLoad() {
    await this.waitForDisplayed(this.title);
  }

  /**
   * Read the current status of a permission entry from its content-desc.
   * The content-desc follows the pattern: "<Name>\n<Status>"
   * e.g. "Camera\nNot checked", "Camera\nGranted", "Camera\nDenied",
   *      "Camera\nPermanently Denied\nOn simulator, some permissions auto-deny...",
   *      "Location\nGranted (no GPS fix)"
   * Parenthetical suffixes like "(no GPS fix)" are stripped so specs can assert
   * plain "Granted" regardless of GPS availability on the device/emulator.
   * @param {string} entrySelector - Selector for the permission entry
   * @returns {Promise<string>} The status string (e.g. "Not checked", "Granted", "Denied", "Permanently Denied")
   */
  async getPermissionStatus(entrySelector) {
    const el = await this.driver.$(entrySelector);
    const desc = await el.getAttribute('content-desc');
    const parts = String(desc).split('\n');
    const raw = parts.length > 1 ? parts[1].trim() : '';
    // Strip parenthetical qualifiers like "(no GPS fix)" → ""
    return raw.replace(/\s*\(.*?\)\s*/g, '').trim();
  }

  /**
   * Tap the Request button for a specific permission.
   * @param {string} requestBtnSelector - Selector for the permission's Request button
   */
  async tapRequest(requestBtnSelector) {
    const btn = await this.driver.$(requestBtnSelector);
    await btn.click();
    await this.driver.pause(500);
  }

  /**
   * Accept the native permission dialog by tapping "While using the app".
   * Waits for the dialog to appear, taps accept, then waits for dismissal.
   * Falls back to the generic "Allow" button on pre-API-30 emulators
   * (e.g. CI on API 29) where the foreground-only button doesn't exist.
   */
  async acceptWhileUsing() {
    try {
      const btn = await this.driver.$(this.allowWhileUsingBtn);
      await btn.waitForDisplayed({ timeout: 2000 });
      await btn.click();
    } catch {
      // Fallback: try the generic "Allow" button (API 29 and below)
      const fallback = await this.driver.$(this.allowGenericBtn);
      await fallback.waitForDisplayed({ timeout: 5000 });
      await fallback.click();
    }
    await this.driver.pause(2000);
  }


  /**
   * Accept the native permission dialog by tapping "Only this time".
   * Waits for the dialog to appear, taps accept, then waits for dismissal.
   * Falls back to the generic "Allow" button on pre-API-30 emulators
   * (e.g. CI on API 29) where the one-time button doesn't exist.
   */
  async acceptOneTime() {
    try {
      const btn = await this.driver.$(this.allowOneTimeBtn);
      await btn.waitForDisplayed({ timeout: 2000 });
      await btn.click();
    } catch {
      // Fallback: try the generic "Allow" button (API 29 and below)
      const fallback = await this.driver.$(this.allowGenericBtn);
      await fallback.waitForDisplayed({ timeout: 5000 });
      await fallback.click();
    }
    await this.driver.pause(2000);
  }


  /**
   * Deny the native permission dialog by tapping "Don't allow".
   * Waits for the dialog to appear, taps deny, then waits for dismissal.
   */
  async denyPermission() {
    const btn = await this.driver.$(this.denyBtn);
    await btn.waitForDisplayed({ timeout: 7000 });
    await btn.click();
    await this.driver.pause(2000);
  }

  /**
   * Wait for a permission's status to reach an expected value, polling at 500ms intervals.
   * Handles transitional states like "Getting location..." → "Granted".
   * The status is normalized through getPermissionStatus (strips "(no GPS fix)" etc.).
   * @param {string} entrySelector - Selector for the permission entry
   * @param {string} expectedStatus - e.g. "Granted", "Denied", "Permanently Denied"
   * @param {number} [timeout=10000] - Max wait time in ms
   */
  async waitForPermissionStatus(entrySelector, expectedStatus, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const status = await this.getPermissionStatus(entrySelector);
      if (status === expectedStatus) return;
      await this.driver.pause(500);
    }
  }

  /**
   * Check if the "Open Settings" button is visible inside a permission entry.
   * Only appears when the permission status is "Permanently Denied".
   * @param {string} entrySelector - Selector for the permission entry
   * @returns {Promise<boolean>}
   */
  async hasOpenSettingsButton(entrySelector) {
    try {
      const entry = await this.driver.$(entrySelector);
      const settingsBtn = await entry.$(this.openSettingsBtn);
      return await settingsBtn.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Extract a specific field value from the Storage Info section.
   * The content-desc follows: "Storage Info\nTotal\n5.8G\nUsed\n4.8G\nAvailable\n785M"
   * @param {string} fieldLabel - e.g. "Total", "Used", "Available"
   * @returns {Promise<string>} The value string, e.g. "5.8G", "4.8G", "785M"
   */
  async getStorageField(fieldLabel) {
    const el = await this.driver.$(this.storageInfoEntry);
    const desc = await el.getAttribute('content-desc');
    const parts = String(desc).split('\n');
    for (let i = 0; i < parts.length - 1; i++) {
      if (parts[i].trim() === fieldLabel) {
        return parts[i + 1].trim();
      }
    }
    return '';
  }

  /**
   * Scroll the page down to reveal the Storage Info section below the fold.
   * Storage is auto-granted and shows Storage Info (Total/Used/Available)
   * which is positioned below the visible viewport on phone screens.
   */
  async scrollDownToStorageInfo() {
    const { height, width } = await this.driver.getWindowRect();
    const centerX = Math.round(width * 0.5);
    await this.swipe(centerX, Math.round(height * 0.7), centerX, Math.round(height * 0.3), 800);
    await this.driver.pause(500);
  }

  // ── Backwards Compatibility Aliases ──

  /**
   * Accept an incoming native dialog with "While using the app" fallback to "Only this time".
   * @deprecated Use acceptWhileUsing() or acceptOneTime() explicitly.
   */
  async acceptNativeDialog() {
    try {
      await this.acceptWhileUsing();
    } catch {
      await this.acceptOneTime();
    }
  }

  /**
   * Deny the native permission dialog.
   * @deprecated Use denyPermission() instead.
   */
  async denyNativeDialog() {
    await this.denyPermission();
  }

  /**
   * Reset all app permissions via ADB shell.
   * Clears the permission state back to "Not checked" for all permissions.
   */
  async resetPermissions() {
    if (this.isAndroid) {
      await this.driver.execute('mobile: shell', {
        command: 'pm',
        args: ['reset-permissions', this.appPackage],
      });
      await this.driver.pause(1000);
      // Re-activate the app after the shell command minimizes it
      await this.deviceForeground();
      await this.driver.pause(500);
    }
    // iOS: will be added when iOS testing begins (e.g. uninstall/reinstall or Settings nav)
  }
}

module.exports = { PermissionsPage };
