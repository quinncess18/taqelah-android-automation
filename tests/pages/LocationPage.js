// @ts-check
const { BasePage } = require('./BasePage');

/**
 * LocationPage — POM for the Location module.
 *
 * Permission flow on entry: single OS dialog (Precise/Approximate +
 * While using / Only this time / Don't allow). No back-to-back dialog
 * sequence (unlike Camera, which prompts Audio after Camera).
 *
 * Location screen states:
 *   - Idle granted: header + Current Location card (Lat/Lng/Altitude/Speed/
 *     Accuracy) + Refresh button + Start Tracking button. No tracking
 *     indicator, no History section yet.
 *   - Tracking: same as idle plus Stop Tracking (replaces Start) +
 *     "Tracking location updates..." indicator + Location History section.
 *     History entries appear as scrollable views with content-desc
 *     "<lat>, <lng>\n<HH:mm:ss>\n±<n>m".
 *   - Denied: header + "Location permission denied" + "Open Settings".
 *
 * History list is a Flutter ListView.builder-style virtualized list — only rendered (~visible)
 * entries appear in the a11y tree. Use collectAllHistoryEntries() to
 * scroll-and-dedupe across the full list.
 *
 * Refresh button is a confirmed no-op (does not produce history entries
 * or change the Current Location card on emulator). Each Start Tracking
 * tap inserts exactly one history entry, provided GPS dwell ≥ ~3s.
 */
class LocationPage extends BasePage {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    super(driver);

    // ── Page header ──
    this.screenTitle = this.isAndroid
      ? 'android=new UiSelector().description("Location")'
      : '~Location';

    // ── Granted state widgets ──
    this.startTrackingBtn = this.isAndroid
      ? 'android=new UiSelector().description("Start Tracking")'
      : '~Start Tracking';

    this.stopTrackingBtn = this.isAndroid
      ? 'android=new UiSelector().description("Stop Tracking")'
      : '~Stop Tracking';

    this.refreshBtn = this.isAndroid
      ? 'android=new UiSelector().description("Refresh")'
      : '~Refresh';

    this.trackingIndicator = this.isAndroid
      ? 'android=new UiSelector().description("Tracking location updates...")'
      : '~tracking-indicator';

    this.locationHistoryHeader = this.isAndroid
      ? 'android=new UiSelector().description("Location History")'
      : '~Location History';

    // Current Location card content-desc concatenates all 5 fields with
    // newlines. We match the prefix so a regex check on the full value
    // can verify field presence.
    this.currentLocationCard = this.isAndroid
      ? 'android=new UiSelector().descriptionStartsWith("Current Location")'
      : '~current-location-card';

    // ── Denied state ──
    this.permissionDeniedText = this.isAndroid
      ? 'android=new UiSelector().description("Location permission denied")'
      : '~location-permission-denied';

    this.openSettingsBtn = this.isAndroid
      ? 'android=new UiSelector().description("Open Settings")'
      : '~open-settings';

    // ── OS Permission Dialog (PermissionController) ──
    this.allowWhileUsingBtn = this.isAndroid
      ? 'android=new UiSelector().resourceId("com.android.permissioncontroller:id/permission_allow_foreground_only_button")'
      : '~While using the app';

    this.allowOneTimeBtn = this.isAndroid
      ? 'android=new UiSelector().resourceId("com.android.permissioncontroller:id/permission_allow_one_time_button")'
      : '~Only this time';

    this.denyBtn = this.isAndroid
      ? 'android=new UiSelector().resourceIdMatches(".*permission_deny.*")'
      : "~Don't allow";

    // Pacing — Start Tracking dwell must be long enough for the emulator
    // GPS mock to return a fix and the entry to land in the History list.
    // Scratch verified ≥3s reliable; using 3500ms for headroom.
    this.startDwellMs = 3500;
  }

  // ── Page-load gates ──────────────────────────────────────────────────

  /**
   * Title-only wait. Universal across all Location states (idle, tracking,
   * denied). State-specific widgets get their own waits below.
   */
  async waitForPageLoad() {
    await this.waitForDisplayed(this.screenTitle, 15000);
  }

  /**
   * Wait for the granted-state UI (post permission accept, pre Start Tracking).
   */
  async waitForGrantedIdle() {
    // Card-render is gated on a GPS fix. Local Pixel 8 returns sub-second;
    // Pixel Tablet AVD ~10–15s; CI Pixel 6 cold-boot has been observed to
    // exceed 25s and crash the UiAutomator2 instrumentation. The spec calls
    // warmupGeo() before granting permission so a fix is queued and the
    // card renders almost immediately — the 60s ceiling here is defensive
    // headroom for CI cases where the injection itself races the app.
    const t0 = Date.now();
    await this.waitForDisplayed(this.screenTitle, 15000);
    console.log(`[LO02] title visible at +${Date.now() - t0}ms`);
    await this.waitForDisplayed(this.currentLocationCard, 60000);
    console.log(`[LO02] card visible at +${Date.now() - t0}ms`);
    await this.waitForDisplayed(this.refreshBtn, 10000);
    console.log(`[LO02] refresh visible at +${Date.now() - t0}ms`);
    await this.waitForDisplayed(this.startTrackingBtn, 10000);
    console.log(`[LO02] startTracking visible at +${Date.now() - t0}ms — granted-idle OK`);
  }

  /**
   * Inject a mock GPS fix via Appium's setGeoLocation. Side-steps the
   * emulator's own location provider, which on the CI Pixel 6 cold boot
   * doesn't emit a fix fast enough for the granted-state card render
   * (causing TC-LO02 to time out and then crash UiAutomator2). Requires
   * io.appium.settings to hold ACCESS_*_LOCATION (granted in appFixture
   * pre-flight on emulator targets; CI workflow grants too).
   *
   * Coordinates default to Singapore (taqelah.sg's nominal context).
   * Idempotent and a no-op on iOS / cloud-target sessions.
   */
  async warmupGeo({ latitude = 1.2966, longitude = 103.8547, altitude = 30 } = {}) {
    if (!this.isAndroid) return;
    try {
      await this.driver.execute('mobile: setGeolocation', { latitude, longitude, altitude });
      await this.driver.pause(500);
    } catch (err) {
      console.warn(`[LocationPage] warmupGeo non-fatal: ${err.message}`);
    }
  }

  /**
   * Poll `mobile: getGeolocation` until it returns coordinates close to the
   * injected warmupGeo target, or the timeout expires. Closes the race
   * between `setGeolocation` (returns immediately) and the Android system
   * location provider actually propagating the fix to subscribers — on
   * cold CI emulators that propagation can take several seconds, and if
   * the app polls before the provider has the fix, the granted-state card
   * stalls on real GPS (which never warms).
   *
   * Returns true if a matching fix is observed, false on timeout (caller
   * decides whether to proceed regardless — typically yes, since the
   * 60s card wait still provides a safety net).
   */
  async waitForGeoFix({ latitude = 1.2966, longitude = 103.8547, toleranceDeg = 0.01, timeoutMs = 10000, intervalMs = 300 } = {}) {
    if (!this.isAndroid) return true;
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      try {
        const fix = await this.driver.execute('mobile: getGeolocation');
        if (fix && typeof fix.latitude === 'number' && typeof fix.longitude === 'number') {
          if (Math.abs(fix.latitude - latitude) <= toleranceDeg &&
              Math.abs(fix.longitude - longitude) <= toleranceDeg) {
            console.log(`[LO02] geo fix confirmed at +${Date.now() - t0}ms (${fix.latitude}, ${fix.longitude})`);
            return true;
          }
        }
      } catch (err) {
        // getGeolocation can throw early in session lifecycle; tolerate and retry.
      }
      await this.driver.pause(intervalMs);
    }
    console.warn(`[LO02] waitForGeoFix timeout after ${timeoutMs}ms — proceeding without verified fix`);
    return false;
  }

  /**
   * Wait for the tracking state (post Start Tracking tap).
   */
  async waitForTrackingState() {
    await this.waitForDisplayed(this.screenTitle, 15000);
    await this.waitForDisplayed(this.stopTrackingBtn, 10000);
    await this.waitForDisplayed(this.trackingIndicator, 10000);
  }

  /**
   * Wait for the denied-state UI (post permission deny).
   */
  async waitForDeniedState() {
    await this.waitForDisplayed(this.screenTitle, 15000);
    await this.waitForDisplayed(this.permissionDeniedText, 10000);
    await this.waitForDisplayed(this.openSettingsBtn, 10000);
  }

  // ── OS Dialog ────────────────────────────────────────────────────────

  async waitForDialog(timeout = 10000) {
    await this.waitForDisplayed(this.allowWhileUsingBtn, timeout);
  }

  async isDialogDisplayed() {
    return await this.isVisible(this.allowWhileUsingBtn);
  }

  /**
   * Tap "While using the app" on the OS dialog. Single-dialog flow
   * (Location does NOT have a back-to-back second prompt like Camera).
   */
  async acceptWhileUsing() {
    await this.waitForDialog();
    await (await this.driver.$(this.allowWhileUsingBtn)).click();
    await this.driver.pause(2000);
  }

  /**
   * Tap "Don't allow" on the OS dialog.
   */
  async denyLocation() {
    await this.waitForDialog();
    await (await this.driver.$(this.denyBtn)).click();
    await this.driver.pause(1500);
  }

  // ── Tracking controls ────────────────────────────────────────────────

  /**
   * Tap Start Tracking and wait for the GPS fix to populate one history
   * entry. Dwell is calibrated against the emulator GPS mock; real
   * devices should respond within the same window.
   */
  async tapStartTracking() {
    // Defensive wait — without this, a millisecond-level cold-render race
    // surfaces as a cryptic "element wasn't found" instead of an honest
    // wait-then-fail with the timeout in the message.
    await this.waitForDisplayed(this.startTrackingBtn, 8000);
    await (await this.driver.$(this.startTrackingBtn)).click();
    await this.driver.pause(this.startDwellMs);
  }

  async tapStopTracking() {
    // Defensive wait — see tapStartTracking. The original bare click() is
    // what surfaced in CI run 25849810128 as "element wasn't found" when
    // TC-LO04 retried after a session reload had wiped TC-LO03's state.
    await this.waitForDisplayed(this.stopTrackingBtn, 8000);
    await (await this.driver.$(this.stopTrackingBtn)).click();
    await this.driver.pause(1000);
  }

  /**
   * Detect the current Location screen state. Used by callers that need
   * to self-recover from a session reload mid-spec (Playwright retries
   * an individual TC, not the whole describe — so cascade state is lost).
   *
   * Returns one of:
   *   'tracking' — Stop Tracking visible (mid-tracking)
   *   'idle'     — Start Tracking visible (granted, not yet tracking)
   *   'denied'   — permission denied banner visible
   *   'other'    — none of the above (probably off the Location screen)
   */
  async getCurrentState() {
    if (await this.isVisible(this.stopTrackingBtn)) return 'tracking';
    if (await this.isVisible(this.startTrackingBtn)) return 'idle';
    if (await this.isVisible(this.permissionDeniedText)) return 'denied';
    return 'other';
  }

  /**
   * One Start→dwell→Stop cycle that verifies a new history entry actually
   * landed. The emulator GPS mock occasionally fails to return a fix within
   * the Start dwell on cold sessions, producing a no-op cycle. Up to
   * `maxAttempts` retries are made; each retry re-extends the dwell.
   *
   * Bounded by a wall-clock budget: a single hung getPageSource() on a
   * struggling UIA2 instrumentation could otherwise consume the entire
   * 180s Playwright test budget, then the teardown's budget on top of
   * that (observed in CI run 25849810128 — 6min total before failure).
   * If `budgetMs` is exceeded the call fails fast with diagnostic; the
   * caller learns the cycle never converged rather than waiting for
   * Playwright's outer timeout to fire without context.
   *
   * Returns the new total visible entry count for the caller to assert.
   */
  async cycleStartStop({ maxAttempts = 2, budgetMs = 30000 } = {}) {
    const deadline = Date.now() + budgetMs;
    // Use the newest entry's key (not count) to detect a successful insert:
    // once the screen fold is full, adding a new entry pushes the oldest
    // off-viewport, leaving the visible count unchanged. The newest-key
    // always changes on a successful insert because timestamps are unique.
    const before = await this.readVisibleHistory();
    const beforeKey = before[0]?.key ?? null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (Date.now() > deadline) {
        throw new Error(`[LocationPage] cycleStartStop exceeded budget ${budgetMs}ms after ${attempt - 1} attempt(s); newest key unchanged at ${beforeKey}. Likely GPS mock not producing fixes on this device.`);
      }
      await this.tapStartTracking();
      await this.tapStopTracking();
      const after = await this.readVisibleHistory();
      const afterKey = after[0]?.key ?? null;
      if (afterKey && afterKey !== beforeKey) return after.length;
      console.log(`[LocationPage] cycleStartStop attempt ${attempt}/${maxAttempts} did not insert an entry (newest key unchanged: ${beforeKey}); retrying`);
    }
    return before.length;
  }

  async tapOpenSettings() {
    await (await this.driver.$(this.openSettingsBtn)).click();
    await this.driver.pause(2000);
  }

  // ── History parsing ──────────────────────────────────────────────────

  /**
   * Match history entries in the page source. content-desc format:
   *   "<lat>, <lng>\n<HH:mm:ss>\n±<n>m"
   * XML-encoded newlines appear as &#10;.
   */
  static get HISTORY_ENTRY_REGEX() {
    return /content-desc="(-?\d+\.\d+, -?\d+\.\d+)&#10;(\d{2}:\d{2}:\d{2})&#10;±(\d+)m"/g;
  }

  /**
   * Parse history entries from the currently-rendered page source.
   * Returns entries in document order (newest first — LIFO display).
   * Only includes entries currently in the a11y tree (LazyColumn
   * virtualization may hide off-screen items). Use
   * collectAllHistoryEntries() for the full list.
   */
  async readVisibleHistory() {
    const xml = await this.driver.getPageSource();
    const out = [];
    const re = LocationPage.HISTORY_ENTRY_REGEX;
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(xml)) !== null) {
      out.push({ coords: m[1], time: m[2], acc: m[3], key: `${m[2]}|${m[1]}|${m[3]}` });
    }
    return out;
  }

  /**
   * Scroll the history list from top to bottom, deduping entries by
   * `<time>|<coords>|<acc>` key. Returns entries sorted newest-first.
   * Stops when a scroll produces no new entries.
   */
  async collectAllHistoryEntries({ maxScrolls = 3 } = {}) {
    // The Location screen always loads at the top fold (Current Location
    // card visible), so no pre-scroll is needed. We swipe up only as far
    // as required to discover new entries, then restore with a single
    // swipe down so the header Back button is back in viewport.
    const seen = new Map();
    for (let s = 0; s <= maxScrolls; s++) {
      const entries = await this.readVisibleHistory();
      const before = seen.size;
      entries.forEach((e) => seen.set(e.key, e));
      if (s > 0 && seen.size === before) break;
      if (s < maxScrolls) await this._swipeUp();
    }
    await this.scrollHistoryToTop();
    return [...seen.values()].sort((a, b) => b.time.localeCompare(a.time));
  }

  // ── Scroll helpers ───────────────────────────────────────────────────

  async _swipeUp() {
    const { width, height } = await this.driver.getWindowRect();
    const x = Math.floor(width / 2);
    await this.driver.performActions([{
      type: 'pointer', id: 'f1', parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x, y: Math.floor(height * 0.75) },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 100 },
        { type: 'pointerMove', duration: 400, x, y: Math.floor(height * 0.35) },
        { type: 'pointerUp', button: 0 },
      ],
    }]);
    await this.driver.releaseActions();
    await this.driver.pause(500);
  }

  async _swipeDown() {
    const { width, height } = await this.driver.getWindowRect();
    const x = Math.floor(width / 2);
    await this.driver.performActions([{
      type: 'pointer', id: 'f1', parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x, y: Math.floor(height * 0.35) },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 100 },
        { type: 'pointerMove', duration: 400, x, y: Math.floor(height * 0.75) },
        { type: 'pointerUp', button: 0 },
      ],
    }]);
    await this.driver.releaseActions();
    await this.driver.pause(500);
  }

  /**
   * Restore the page to the top fold (Current Location card + header
   * Back visible). One downward swipe is sufficient because the history
   * fold is short — the test never scrolls far below the bottom fold.
   * Safe to call when already at top (no-op).
   */
  async scrollHistoryToTop() {
    await this._swipeDown();
  }

  // ── Foreground / reset ───────────────────────────────────────────────

  async getForegroundPackage() {
    if (!this.isAndroid) return '';
    return String(await this.driver.getCurrentPackage());
  }

  /**
   * Reset app data + relaunch so the next entry re-prompts the OS
   * Location dialog. Same `pm clear` pattern as Camera / Notifications:
   * the DemoApp tracks "have we asked?" in SharedPreferences, so
   * `pm reset-permissions` alone leaves the dialog suppressed.
   *
   * Side effect: wipes login → caller must re-authenticate.
   */
  async resetLocationPermission() {
    if (!this.isAndroid) return;
    await this.driver.execute('mobile: shell', {
      command: 'pm',
      args: ['clear', this.appPackage],
    });
    await this.driver.pause(2500);
    await this.driver.execute('mobile: shell', {
      command: 'am',
      args: ['start', '-W', '-n', `${this.appPackage}/.MainActivity`],
    });
    await this.driver.pause(1500);
  }
}

module.exports = { LocationPage };
