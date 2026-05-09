// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
const { NavMenuPage } = require('../../pages/NavMenuPage');
const { PermissionsPage } = require('../../pages/PermissionsPage');

test.describe('Navigation - Permissions Suite (TC-P01-P04)', () => {
  let landingPage;
  let navMenu;
  let permsPage;

  test.beforeAll(async ({ driver }) => {
    landingPage = new CatalogLandingPage(driver);
    navMenu = new NavMenuPage(driver);
    permsPage = new PermissionsPage(driver);

    // SELF-HEALING: return to the DemoApp Homepage if deep-linked.
    let onHome = await landingPage.isVisible(landingPage.shopAllBtn);
    let retryCount = 0;
    while (!onHome && retryCount < 3) {
      await driver.back();
      await driver.pause(1000);
      onHome = await landingPage.isVisible(landingPage.shopAllBtn);
      retryCount++;
    }

    // Reset permissions to clean state so P01 always starts with "Not checked"
    // regardless of any prior manual or automated permission grants.
    await permsPage.resetPermissions();
    await driver.pause(1000);

    // Navigate to Permissions page
    await navMenu.open();
    await navMenu.navigateTo(navMenu.navPermissions);
    await permsPage.waitForPageLoad();
  });

  test('TC-P01: should verify Permissions page default state with all entries "Not checked"', async ({ driver }) => {
    // Header elements
    expect(await permsPage.isVisible(permsPage.title)).toBe(true);
    expect(await permsPage.isVisible(permsPage.backBtn)).toBe(true);

    // Description
    expect(await permsPage.isVisible(permsPage.description)).toBe(true);

    // All three permission entries visible
    expect(await permsPage.isVisible(permsPage.cameraEntry)).toBe(true);
    expect(await permsPage.isVisible(permsPage.locationEntry)).toBe(true);
    expect(await permsPage.isVisible(permsPage.storageEntry)).toBe(true);

    // All three Request buttons visible
    expect(await permsPage.isVisible(permsPage.cameraRequestBtn)).toBe(true);
    expect(await permsPage.isVisible(permsPage.locationRequestBtn)).toBe(true);
    expect(await permsPage.isVisible(permsPage.storageRequestBtn)).toBe(true);

    // All permissions start as "Not checked"
    expect(await permsPage.getPermissionStatus(permsPage.cameraEntry)).toBe('Not checked');
    expect(await permsPage.getPermissionStatus(permsPage.locationEntry)).toBe('Not checked');
    expect(await permsPage.getPermissionStatus(permsPage.storageEntry)).toBe('Not checked');

    // "Open Settings" not visible in default state
    expect(await permsPage.hasOpenSettingsButton(permsPage.cameraEntry)).toBe(false);
    expect(await permsPage.hasOpenSettingsButton(permsPage.locationEntry)).toBe(false);
  });

  test('TC-P02: should grant Camera (with Audio error recovery), Location, Storage and verify persistence', async ({ driver }) => {
    // ── Camera: Video → "While using" → Audio → "Don't allow" → "Camera init error" ──
    // Camera triggers 2 sequential dialogs when granting (Video then Audio).
    // Denying Audio triggers an error state that recovers after re-requesting audio.
    await permsPage.tapRequest(permsPage.cameraRequestBtn);
    await permsPage.acceptWhileUsing();
    await permsPage.denyPermission();
    // Wait for the dialog dismissal animation to complete before probing the entry
    // (CI emulators are slower and the dimming overlay may still be present)
    await permsPage.waitForDisplayed(permsPage.cameraEntry);
    expect(await permsPage.getPermissionStatus(permsPage.cameraEntry)).toBe('Camera init error');

    // Camera recovery: Request again → Audio → "Only this time" → "Granted"
    await permsPage.tapRequest(permsPage.cameraRequestBtn);
    await permsPage.acceptOneTime();
    expect(await permsPage.getPermissionStatus(permsPage.cameraEntry)).toBe('Granted');

    // ── Location: Request → "While using the app" ──
    // Poll through transient "Getting location..." state (safer on slower emulators)
    await permsPage.tapRequest(permsPage.locationRequestBtn);
    await permsPage.acceptWhileUsing();
    await permsPage.waitForPermissionStatus(permsPage.locationEntry, 'Granted');

    // ── Storage: Request → auto-grants (no OS dialog) ──
    await permsPage.tapRequest(permsPage.storageRequestBtn);
    expect(await permsPage.getPermissionStatus(permsPage.storageEntry)).toBe('Granted');

    // Scroll down to reveal Storage Info section below the fold
    await permsPage.scrollDownToStorageInfo();

    // Storage Info fields should contain non-empty values (device-agnostic)
    expect(await permsPage.isVisible(permsPage.storageInfoEntry)).toBe(true);
    expect(await permsPage.getStorageField('Total')).toBeTruthy();
    expect(await permsPage.getStorageField('Used')).toBeTruthy();
    expect(await permsPage.getStorageField('Available')).toBeTruthy();

    // ── Persistence: navigate away and back ──
    await driver.back();
    await driver.pause(1000);
    expect(await landingPage.isVisible(landingPage.shopAllBtn)).toBe(true);

    await navMenu.open();
    await navMenu.navigateTo(navMenu.navPermissions);
    await permsPage.waitForPageLoad();

    // Tap Request buttons to confirm no OS dialog appears (state unchanged)
    await permsPage.tapRequest(permsPage.cameraRequestBtn);
    await permsPage.tapRequest(permsPage.locationRequestBtn);
    await permsPage.tapRequest(permsPage.storageRequestBtn);

    // Scroll down to verify Storage Info persistence
    await permsPage.scrollDownToStorageInfo();

    // Verify all statuses persisted
    expect(await permsPage.getPermissionStatus(permsPage.cameraEntry)).toBe('Granted');
    expect(await permsPage.getPermissionStatus(permsPage.locationEntry)).toBe('Granted');
    expect(await permsPage.getPermissionStatus(permsPage.storageEntry)).toBe('Granted');
    expect(await permsPage.isVisible(permsPage.storageInfoEntry)).toBe(true);
    expect(await permsPage.getStorageField('Total')).toBeTruthy();
    expect(await permsPage.getStorageField('Used')).toBeTruthy();
    expect(await permsPage.getStorageField('Available')).toBeTruthy();
  });

  test('TC-P03: should grant Camera (While using), Location (Only this time), Storage and verify persistence', async ({ driver }) => {
    // Reset permissions for fresh state
    await permsPage.resetPermissions();
    // Wait for Home to fully render before navigating (CI emulator is slower)
    await landingPage.waitForDisplayed(landingPage.shopAllBtn, 15000);

    // Navigate back to Permissions page (reset re-launches the app to Home)
    await navMenu.open();
    await navMenu.navigateTo(navMenu.navPermissions);
    await permsPage.waitForPageLoad();

    // Verify clean state
    expect(await permsPage.getPermissionStatus(permsPage.cameraEntry)).toBe('Not checked');
    expect(await permsPage.getPermissionStatus(permsPage.locationEntry)).toBe('Not checked');
    expect(await permsPage.getPermissionStatus(permsPage.storageEntry)).toBe('Not checked');

    // ── Camera: Video → "While using" → Audio → "While using" → "Granted" ──
    await permsPage.tapRequest(permsPage.cameraRequestBtn);
    await permsPage.acceptWhileUsing();
    await permsPage.acceptWhileUsing();
    expect(await permsPage.getPermissionStatus(permsPage.cameraEntry)).toBe('Granted');

    // ── Location: Request → "Only this time" ──
    // Poll through transient "Getting location..." state (safer on slower emulators)
    await permsPage.tapRequest(permsPage.locationRequestBtn);
    await permsPage.acceptOneTime();
    await permsPage.waitForPermissionStatus(permsPage.locationEntry, 'Granted');

    // ── Storage: Request → auto-grants ──
    await permsPage.tapRequest(permsPage.storageRequestBtn);
    expect(await permsPage.getPermissionStatus(permsPage.storageEntry)).toBe('Granted');

    // Scroll down to reveal Storage Info section below the fold
    await permsPage.scrollDownToStorageInfo();

    // Storage Info fields should contain non-empty values (device-agnostic)
    expect(await permsPage.isVisible(permsPage.storageInfoEntry)).toBe(true);
    expect(await permsPage.getStorageField('Total')).toBeTruthy();
    expect(await permsPage.getStorageField('Used')).toBeTruthy();
    expect(await permsPage.getStorageField('Available')).toBeTruthy();

    // ── Persistence: navigate away and back ──
    await driver.back();
    await driver.pause(1000);
    expect(await landingPage.isVisible(landingPage.shopAllBtn)).toBe(true);

    await navMenu.open();
    await navMenu.navigateTo(navMenu.navPermissions);
    await permsPage.waitForPageLoad();

    // Tap Request buttons to confirm no OS dialog appears (state unchanged)
    await permsPage.tapRequest(permsPage.cameraRequestBtn);
    await permsPage.tapRequest(permsPage.locationRequestBtn);
    await permsPage.tapRequest(permsPage.storageRequestBtn);

    // Scroll down to verify Storage Info persistence
    await permsPage.scrollDownToStorageInfo();

    // Verify all statuses persisted
    expect(await permsPage.getPermissionStatus(permsPage.cameraEntry)).toBe('Granted');
    expect(await permsPage.getPermissionStatus(permsPage.locationEntry)).toBe('Granted');
    expect(await permsPage.getPermissionStatus(permsPage.storageEntry)).toBe('Granted');
    expect(await permsPage.isVisible(permsPage.storageInfoEntry)).toBe(true);
    expect(await permsPage.getStorageField('Total')).toBeTruthy();
    expect(await permsPage.getStorageField('Used')).toBeTruthy();
    expect(await permsPage.getStorageField('Available')).toBeTruthy();
  });

  test('TC-P04: should deny Camera and Location twice, verify "Permanently Denied", auto-grant Storage, and verify persistence', async ({ driver }) => {
    // Reset permissions for fresh state
    await permsPage.resetPermissions();
    // Wait for Home to fully render before navigating (CI emulator is slower)
    await landingPage.waitForDisplayed(landingPage.shopAllBtn, 15000);

    // Navigate back to Permissions page (reset re-launches the app to Home)
    await navMenu.open();
    await navMenu.navigateTo(navMenu.navPermissions);
    await permsPage.waitForPageLoad();

    // Verify clean state
    expect(await permsPage.getPermissionStatus(permsPage.cameraEntry)).toBe('Not checked');
    expect(await permsPage.getPermissionStatus(permsPage.locationEntry)).toBe('Not checked');
    expect(await permsPage.getPermissionStatus(permsPage.storageEntry)).toBe('Not checked');

    // ── Camera: 1st trigger "Don't allow" on Video → "Denied" ──
    // Camera shows only 1 dialog (Video) when denying (Audio only appears if Video is granted).
    await permsPage.tapRequest(permsPage.cameraRequestBtn);
    await permsPage.denyPermission();
    expect(await permsPage.getPermissionStatus(permsPage.cameraEntry)).toBe('Denied');

    // Camera: 2nd trigger "Don't allow" on Video → "Permanently Denied"
    await permsPage.tapRequest(permsPage.cameraRequestBtn);
    await permsPage.denyPermission();
    expect(await permsPage.getPermissionStatus(permsPage.cameraEntry)).toBe('Permanently Denied');
    expect(await permsPage.hasOpenSettingsButton(permsPage.cameraEntry)).toBe(true);

    // ── Location: 1st trigger "Don't allow" → "Denied" ──
    await permsPage.tapRequest(permsPage.locationRequestBtn);
    await permsPage.denyPermission();
    expect(await permsPage.getPermissionStatus(permsPage.locationEntry)).toBe('Denied');

    // Location: 2nd trigger "Don't allow" → "Permanently Denied"
    await permsPage.tapRequest(permsPage.locationRequestBtn);
    await permsPage.denyPermission();
    expect(await permsPage.getPermissionStatus(permsPage.locationEntry)).toBe('Permanently Denied');
    expect(await permsPage.hasOpenSettingsButton(permsPage.locationEntry)).toBe(true);

    // ── Storage: Request → auto-grants ──
    await permsPage.tapRequest(permsPage.storageRequestBtn);
    expect(await permsPage.getPermissionStatus(permsPage.storageEntry)).toBe('Granted');

    // Scroll down to reveal Storage Info section below the fold
    await permsPage.scrollDownToStorageInfo();

    // Storage Info fields should contain non-empty values
    expect(await permsPage.isVisible(permsPage.storageInfoEntry)).toBe(true);
    expect(await permsPage.getStorageField('Total')).toBeTruthy();
    expect(await permsPage.getStorageField('Used')).toBeTruthy();
    expect(await permsPage.getStorageField('Available')).toBeTruthy();

    // ── Persistence: navigate away and back ──
    await driver.back();
    await driver.pause(1000);
    expect(await landingPage.isVisible(landingPage.shopAllBtn)).toBe(true);

    await navMenu.open();
    await navMenu.navigateTo(navMenu.navPermissions);
    await permsPage.waitForPageLoad();

    // Tap Request buttons to confirm no OS dialog appears (state unchanged)
    await permsPage.tapRequest(permsPage.cameraRequestBtn);
    await permsPage.tapRequest(permsPage.locationRequestBtn);
    await permsPage.tapRequest(permsPage.storageRequestBtn);

    // Scroll down to verify Storage Info persistence
    await permsPage.scrollDownToStorageInfo();

    // Verify all statuses persisted
    expect(await permsPage.getPermissionStatus(permsPage.cameraEntry)).toBe('Permanently Denied');
    expect(await permsPage.getPermissionStatus(permsPage.locationEntry)).toBe('Permanently Denied');
    expect(await permsPage.getPermissionStatus(permsPage.storageEntry)).toBe('Granted');
    expect(await permsPage.hasOpenSettingsButton(permsPage.cameraEntry)).toBe(true);
    expect(await permsPage.hasOpenSettingsButton(permsPage.locationEntry)).toBe(true);
    expect(await permsPage.isVisible(permsPage.storageInfoEntry)).toBe(true);
    expect(await permsPage.getStorageField('Total')).toBeTruthy();
    expect(await permsPage.getStorageField('Used')).toBeTruthy();
    expect(await permsPage.getStorageField('Available')).toBeTruthy();
  });
});
