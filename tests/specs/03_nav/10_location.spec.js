// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
const { NavMenuPage } = require('../../pages/NavMenuPage');
const { LocationPage } = require('../../pages/LocationPage');

/**
 * Location Suite — two pm clear resets:
 *   1. Granted-path describe (TC-LO01–LO05) — single dialog, grant once,
 *      cascade through tracking, cycle, persistence.
 *   2. Denied-path describe (TC-LO06–LO08) — deny inline.
 *
 * Each Start Tracking tap inserts exactly one history entry provided
 * the GPS-fix dwell is ≥3s (LocationPage.startDwellMs). History list is
 * a Compose LazyColumn — newest entries render first; older entries are
 * present but require scrolling. No eviction observed at ≤10 entries.
 *
 * Deferred to real-device cloud:
 *   - "Only this time" grant variant (emulator mock makes the re-prompt
 *     distinction superficial).
 *   - Approximate accuracy (emulator mock ignores the Precise/Approximate
 *     toggle).
 */

const HISTORY_DOC_RE = /^-?\d+\.\d+, -?\d+\.\d+\n\d{2}:\d{2}:\d{2}\n±\d+m$/;
const CURRENT_LOCATION_RE = /^Current Location\nLatitude\n.+\nLongitude\n.+\nAltitude\n.+\nSpeed\n.+\nAccuracy\n.+$/s;

async function gotoLocationFresh(driver) {
  const loginPage = new LoginPage(driver);
  const landingPage = new CatalogLandingPage(driver);
  const navMenu = new NavMenuPage(driver);
  const locationPage = new LocationPage(driver);

  await locationPage.resetLocationPermission();

  await loginPage.waitForDisplayed(loginPage.loginButton, 15000);
  await loginPage.login(loginPage.defaultUser, loginPage.defaultPass);
  await landingPage.waitForDisplayed(landingPage.shopAllBtn, 15000);

  await navMenu.open();
  // Location is the last item in the TEST SCREENS group and sits at the
  // bottom edge of the drawer on most form factors. NavMenuPage.scrollToItem
  // only auto-scrolls when isDisplayed=false; an item that is visible-but-
  // clipped at the bottom passes that gate and gets tapped at a partial hit
  // zone, which flakes on smaller screens (CI Pixel 6) and any future device
  // where Location lands right at the fold. Force one drawer-internal swipe
  // up so Location is pushed toward the centre before the tap. The X/Y
  // math mirrors NavMenuPage.scrollToItem to stay inside the drawer column.
  const { width, height } = await driver.getWindowRect();
  const safeX = Math.round(width * (width > 1200 ? 0.15 : 0.3));
  await navMenu.swipe(safeX, Math.round(height * 0.7), safeX, Math.round(height * 0.3), 800);

  // Queue a mock GPS fix BEFORE the app gets location permission. Once the
  // user grants ("While using the app"), the Current Location card polls
  // the system provider — with the mock pre-set, the fix is immediate
  // instead of waiting on the AVD's slow provider warm-up (the root cause
  // of TC-LO02 timing out + UIA2 crashing on CI Pixel 6 cold boot).
  await locationPage.warmupGeo();

  await navMenu.navigateTo(navMenu.navLocation);

  // The Location screen requests OS permission on mount; the dialog renders
  // ~hundreds of ms after navigateTo returns. Without this wait, TC-LO01 /
  // TC-LO06 race the dialog and assert on an empty screen. The previous
  // green runs were timing-lucky.
  await locationPage.waitForDialog(15000);

  return locationPage;
}

test.describe('Navigation - Location Suite — Granted Path (TC-LO01-LO05)', () => {
  let locationPage;

  test.beforeAll(async ({ driver }) => {
    // Pixel Tablet AVD (emulator-5556): GPS provider does not emit location
    // fixes within practical timeouts (>60s observed manually), so the
    // Current Location card never renders. OS-level permission is granted
    // and Settings confirms "Allow only while using the app" + Use precise
    // location ON — the issue is the AVD's underlying location service,
    // not Appium or the app. Skip until mock-location injection
    // (`mobile: setGeoLocation`) or a real-device cloud target is wired.
    const { width } = await driver.getWindowRect();
    test.skip(width > 1200, 'Pixel Tablet AVD does not emit GPS fixes — Location screen stuck on spinner. Pixel-8-only until tablet GPS is mocked.');

    locationPage = await gotoLocationFresh(driver);
    // Dialog is on screen; TC-LO01 verifies it before LO02 grants.
  });

  test('TC-LO01: should display the OS Location permission dialog on first cold entry', async () => {
    expect(await locationPage.isDialogDisplayed()).toBe(true);
    // While using is the path we drive; Don't allow is the deny option.
    // (Precise/Approximate toggle is API-31+; not asserted to keep API floor at 29.)
    expect(await locationPage.isVisible(locationPage.allowWhileUsingBtn)).toBe(true);
    expect(await locationPage.isVisible(locationPage.denyBtn)).toBe(true);
  });

  test('TC-LO02: should reveal the idle granted screen (Current Location card + Refresh + Start Tracking) after tapping "While using the app"', async ({ driver }) => {
    await locationPage.acceptWhileUsing();
    await locationPage.waitForGrantedIdle();

    expect(await locationPage.isVisible(locationPage.screenTitle)).toBe(true);
    expect(await locationPage.isVisible(locationPage.currentLocationCard)).toBe(true);
    expect(await locationPage.isVisible(locationPage.refreshBtn)).toBe(true);
    expect(await locationPage.isVisible(locationPage.startTrackingBtn)).toBe(true);

    // Tracking-state and denied-state markers must NOT be present.
    expect(await locationPage.isVisible(locationPage.stopTrackingBtn)).toBe(false);
    expect(await locationPage.isVisible(locationPage.trackingIndicator)).toBe(false);
    expect(await locationPage.isVisible(locationPage.permissionDeniedText)).toBe(false);

    // Current Location card carries all 5 fields concatenated with newlines.
    const cardDesc = String(await (await driver.$(locationPage.currentLocationCard)).getAttribute('content-desc'));
    expect(cardDesc).toMatch(CURRENT_LOCATION_RE);
  });

  test('TC-LO03: should enter the tracking state with indicator and the first history entry after tapping Start Tracking', async () => {
    await locationPage.tapStartTracking();
    await locationPage.waitForTrackingState();

    expect(await locationPage.isVisible(locationPage.stopTrackingBtn)).toBe(true);
    expect(await locationPage.isVisible(locationPage.trackingIndicator)).toBe(true);
    expect(await locationPage.isVisible(locationPage.startTrackingBtn)).toBe(false);
    expect(await locationPage.isVisible(locationPage.locationHistoryHeader)).toBe(true);

    const entries = await locationPage.readVisibleHistory();
    expect(entries.length).toBeGreaterThanOrEqual(1);
    // Format check on the newest entry — verify the regex contract.
    const newest = entries[0];
    const reconstructed = `${newest.coords}\n${newest.time}\n±${newest.acc}m`;
    expect(reconstructed).toMatch(HISTORY_DOC_RE);
  });

  test('TC-LO04: should accumulate 6 history entries across Stop/Start cycles, preserve LIFO order, and end on the stopped state', async () => {
    // Cascade: TC-LO03 left us mid-tracking with 1 entry. Stop, then run 5
    // more Start/Stop cycles for a total of 6 entries.
    await locationPage.tapStopTracking();

    for (let i = 0; i < 5; i++) {
      await locationPage.cycleStartStop();
    }

    // Final state: stopped — Start Tracking restored, indicator gone.
    expect(await locationPage.isVisible(locationPage.startTrackingBtn)).toBe(true);
    expect(await locationPage.isVisible(locationPage.stopTrackingBtn)).toBe(false);
    expect(await locationPage.isVisible(locationPage.trackingIndicator)).toBe(false);
    // Current Location card retained after stopping.
    expect(await locationPage.isVisible(locationPage.currentLocationCard)).toBe(true);

    // Scroll-collect the full History list and verify all 6 entries are present
    // (no eviction at this volume) and LIFO-sorted.
    const all = await locationPage.collectAllHistoryEntries();
    expect(all.length).toBeGreaterThanOrEqual(6);

    // LIFO: timestamps strictly non-increasing newest → oldest.
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].time.localeCompare(all[i].time)).toBeGreaterThanOrEqual(0);
    }
  });

  test('TC-LO05: should retain the granted state on re-entry; History is screen-session-scoped and resets', async ({ driver }) => {
    const navMenu = new NavMenuPage(driver);

    await driver.$(locationPage.backBtn).click();
    await driver.pause(1000);

    await navMenu.open();
    await navMenu.navigateTo(navMenu.navLocation);

    // Permission persists — no OS dialog on re-entry.
    expect(await locationPage.isDialogDisplayed()).toBe(false);
    await locationPage.waitForGrantedIdle();

    // History is wiped on screen exit (real app contract — verified manually).
    // The History section is not rendered until tracking is started again.
    expect(await locationPage.isVisible(locationPage.locationHistoryHeader)).toBe(false);
    expect((await locationPage.readVisibleHistory()).length).toBe(0);

    // After one fresh Start/Stop cycle, exactly 1 entry should appear —
    // pre-exit entries are NOT restored.
    await locationPage.cycleStartStop();
    const after = await locationPage.collectAllHistoryEntries();
    expect(after.length).toBe(1);
  });
});

test.describe('Navigation - Location Suite — Denied Path (TC-LO06-LO08)', () => {
  let locationPage;

  test.beforeAll(async ({ driver }) => {
    // Mirror the Granted Path's tablet skip. The denied-state UI itself
    // does not depend on GPS, but the spec is treated as one unit so
    // local runs report a clean "Pixel Tablet: skipped" rather than
    // a half-skipped suite.
    const { width } = await driver.getWindowRect();
    test.skip(width > 1200, 'Location module skipped on Pixel Tablet — see Granted Path beforeAll for rationale.');

    locationPage = await gotoLocationFresh(driver);
    // Dialog is on screen; TC-LO06 handles deny #1.
  });

  test('TC-LO06: should show "Location permission denied" + "Open Settings" after a single dialog deny', async () => {
    expect(await locationPage.isDialogDisplayed()).toBe(true);
    await locationPage.denyLocation();
    await locationPage.waitForDeniedState();

    expect(await locationPage.isVisible(locationPage.permissionDeniedText)).toBe(true);
    expect(await locationPage.isVisible(locationPage.openSettingsBtn)).toBe(true);
    // Granted-state widgets must NOT be present.
    expect(await locationPage.isVisible(locationPage.startTrackingBtn)).toBe(false);
    expect(await locationPage.isVisible(locationPage.currentLocationCard)).toBe(false);
  });

  test('TC-LO07: should deep-link to Android Settings when Open Settings is tapped, and remain on the denied state on return', async ({ driver }) => {
    await locationPage.tapOpenSettings();
    const pkg = await locationPage.getForegroundPackage();
    expect(pkg).toBe('com.android.settings');

    // Back to the DemoApp — denied state must still be shown.
    await driver.back();
    await driver.pause(1500);
    await locationPage.waitForDeniedState();
    expect(await locationPage.isVisible(locationPage.permissionDeniedText)).toBe(true);
    expect(await locationPage.isVisible(locationPage.openSettingsBtn)).toBe(true);
  });

  test('TC-LO08: should suppress the OS dialog after a second deny and remain on the denied state on re-entry (permanent denial)', async ({ driver }) => {
    const navMenu = new NavMenuPage(driver);

    // Leave + re-enter to surface the dialog for deny #2 (Android 13+
    // re-prompts once after a single deny).
    await driver.$(locationPage.backBtn).click();
    await driver.pause(1000);
    await navMenu.open();
    await navMenu.navigateTo(navMenu.navLocation);

    await locationPage.waitForDialog();
    await locationPage.denyLocation();
    await locationPage.waitForDeniedState();

    // 3rd entry — the dialog must NOT appear (permanent denial).
    await driver.$(locationPage.backBtn).click();
    await driver.pause(1000);
    await navMenu.open();
    await navMenu.navigateTo(navMenu.navLocation);
    await locationPage.waitForDeniedState();

    expect(await locationPage.isDialogDisplayed()).toBe(false);
    expect(await locationPage.isVisible(locationPage.permissionDeniedText)).toBe(true);
    expect(await locationPage.isVisible(locationPage.openSettingsBtn)).toBe(true);
  });
});
