# TEST_PLAN.md

Defines the test coverage and verification strategy for the Taqelah mobile application.

**Current scope:** Android emulators — Pixel 8 (API 35, local) + Pixel Tablet (API 35, local) for full coverage; CI runs Pixel 6 profile at API 34 (Android 14, google_apis target). 55 TCs across 7 modules verified on local; CI on API 34 with `retries: 2` to absorb emulator flake.

**Roadmap:** iOS platform support (iPhone 15 Pro, iPad) post-June workshop.

> Status legend: ✅ Verified · ⚠️ Under investigation · ⏳ Pending · — Not applicable

## API Compatibility Matrix

Each module's supported Android API range is an explicit contract. A new module declares its minimum API and rationale; existing modules note any version-specific tuning or constraint that gates them. Tests outside a module's range MUST `test.skip` with a clear reason.

| Module | Min API | Max API tested | Rationale / Constraint |
|---|---|---|---|
| Auth (01) | 29 | 35 | No version-gated APIs. |
| Catalog (02) | 29 | 35 | No version-gated APIs. |
| Nav Main (03/01) | 29 | 35 | No version-gated APIs. |
| Gestures (03/02) | 29 | 35 | Pinch detection unified phone+tablet via dense-scan pixel count (2026-05-12). |
| WebView (03/03) | 29 | 35 | DemoApp builds without `WebContentsDebuggingEnabled` — DOM verification unavailable across all versions. |
| Dialogs (03/04) | 29 | 35 | Time Picker dial canvas tap-anchored selectors work across versions. |
| Form Validation (03/05) | 29 | 35 | Each TC self-resets via back+re-enter (2026-05-12); no cascade fragility. |
| Permissions (03/06) | 29 | 35 | API-29 fallbacks retained (AOSP "Don't ask again" checkbox, generic Allow); inactive on API 33+ via try/catch gating. |
| **Notifications (03/07)** | **33** | **35** | `POST_NOTIFICATIONS` is API 33+ only. Tests would all `waitForDialog` timeout on API ≤ 32. CI MUST run API 33+ for this module to verify. |
| Tabs & Navigation (03/08) | 29 | 35 | No version-gated APIs. Pager swipe geometry (`y = height * 0.55`) works on phone + tablet without branching. |
| Camera (03/09) | 30 | 35 | Uses Android 11+ "While using the app" permission dialog (`permission_allow_foreground_only_button`). API 29 fallbacks not retained — the DemoApp's Camera screen targets the modern foreground-only model. |
| **Location (03/10)** | 29 | 35 | No version-gated dialog widgets. **Pixel Tablet AVD skipped at runtime** (`width > 1200` → `test.skip`) — emulator-5556's GPS provider does not emit fixes within practical timeouts, so the Current Location card never renders even with OS permission granted. Module is Pixel 8 + CI Pixel 6 only until `mobile: setGeoLocation` injection or real-device cloud is wired. |
| **Dark Mode (03/11)** | 29 | 35 | No version-gated widgets. Cross-cutting smoke that visits every previously-tested page in dark mode and validates AppBar background via 3-spot pixel sampling. Location step is skipped on Pixel Tablet only (inherits 10/Location's GPS limitation). |

**Operating contract:**
- Adding a new module → declare its min API + reason. If hardware-feature-gated, document the workaround.
- Bumping CI's API level → audit this matrix. Any module's lower bound that now exceeds CI's API is a hard skip; lower bound that now exceeds local is a regression risk.
- Migration history: CI was on API 29 prior to 2026-05-11; Notifications could not run there. Migration to API 34 unblocked Notifications and required tuning in Permissions (back-to-back dialog wait), Gestures (canvas sampling), Form (toast timing) — see CLAUDE.md.

## 1. Authentication Module
| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-L01** | should verify that the login page elements are visible | Universal POM | ✅ | ✅ |
| **TC-L02** | should toggle password visibility and maintain layout stability | Safe-Zone Interaction | ✅ | ✅ |
| **TC-L03** | should preserve credential state when backgrounded (Home) | Universal Interruption | ✅ | ✅ |
| **TC-L04** | should clear unsaved credential state when exited (Back) | Android-Only Interruption | ✅ | ✅ |
| **TC-L05** | should successfully login with valid demo credentials | Universal E2E | ✅ | ✅ |
| **TC-L06** | should persist session and successfully logout | Universal App State | ✅ | ✅ |
| **TC-N01** | should show validation errors when fields are left empty | Universal POM | ✅ | ✅ |
| **TC-N02** | should show error for invalid username (format) | Universal Negative | ✅ | ✅ |
| **TC-N03** | should show error for valid username with invalid password | Universal Negative | ✅ | ✅ |

## 2. Catalog Module
| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-C01** | Homepage default state, scroll to last category, reset to top | Universal Safe-Zone | ✅ | ✅ |
| **TC-C02** | Cart empty state from Homepage | Universal POM | ✅ | ✅ |
| **TC-C03** | "All Dresses" page default state (alpha-first anchor) | Universal POM | ✅ | ✅ |
| **TC-C04** | Full Catalog Data Integrity (32-item visual scan) | Data-Driven Audit | ✅ | ✅ |
| **TC-C05** | All four sorting modes verified against Universal Truths | Universal Anchor | ✅ | ✅ |
| **TC-C06** | Cart empty state from Grid | Universal POM | ✅ | ✅ |
| **TC-C07** | "View All" hyperlink routing | Universal E2E | ✅ | ✅ |
| **TC-C08** | Casual Dresses data + sort + cart integrity | Data-Driven | ✅ | ✅ |
| **TC-C09** | Evening Dresses data + sort + cart integrity | Data-Driven | ✅ | ✅ |
| **TC-C10** | Party Dresses data + sort + cart integrity | Data-Driven | ✅ | ✅ |
| **TC-C11** | Boho Dresses data + sort + cart integrity | Data-Driven | ✅ | ✅ |

## 3. Navigation & Gestures
| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-M01** | Nav Menu default state + Home routing (above & below fold) | Functional E2E | ✅ | ✅ |
| **TC-M02** | Cart routing from drawer + empty state | Functional E2E | ✅ | ✅ |
| **TC-M03** | About routing + content integrity + Dark Mode toggle (pixel-sampled) | Component + Pixel Sample | ✅ | ✅ |
| **TC-M04** | Randomized sequential swipe (favorite/delete) for 5 cards | W3C Pointer Actions | ✅ | ✅ |
| **TC-M05** | Randomized drag-and-drop reorder with state tracking | Long-press Drag | ✅ | ✅ |
| **TC-M06** | Long-press popup with all three option interactions | Pointer + Toast | ✅ | ✅ |
| **TC-M07** | Double-tap to zoom + pan canvas, verify content via pixel scan | mobile:doubleClickGesture | ✅ | ✅ |
| **TC-M08** | Pinch to zoom + full page reset verification | Multi-finger Pointer | ✅ | ✅ |
| **TC-W01** | WebView opens and displays the Taqelah website correctly | In-App Browser | ✅ | ✅ |
| **TC-W02** | Navigate to a new URL (example.com) using the Go button | URL Navigation | ✅ | ✅ |
| **TC-W03** | WebView Back returns to the app with state preserved | State Preservation | ✅ | ✅ |

> **Tablet-specific implementations** (phone path is byte-identical to before):
> - `getPinchCenterBrightness` uses a dense-scan dark-pixel count across the full canvas on both phone and tablet (unified 2026-05-11; the previous 3×3 brightness average on phone was fragile to icon-interior transparency — the magnifying glass lens center matched the mint background, so 3×3 samples missed the zoom change despite the icon visibly enlarging).
> - `verifyCanvasHasContent` uses a dense canvas-wide scan on tablet (after pan, the icon moves ~1748px — well outside a small center cross).
> - `scrollToDragSection` adds a single page bump on tablet, anchored to the white-space gap below `swipeCard(5)`, so all 5 drag items enter the accessibility tree after re-navigation.
> - `DialogsPage._dialGeometry` uses a side-by-side dialog layout on tablet (header on the LEFT, dial canvas on the RIGHT). Detection: if vertical room between header.bottom and switchBtn.top is < 200px, treat as tablet. Tablet dial center anchored on Cancel button's horizontal center.

## 4. Dialogs & Alerts
| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-D01** | Dialogs page default state with all 7 trigger buttons | Universal POM | ✅ | ✅ |
| **TC-D02** | Alert Dialog with Cancel and OK actions | Universal POM | ✅ | ✅ |
| **TC-D03** | Bottom Sheet display and dismiss via Close button | Universal POM | ✅ | ✅ |
| **TC-D04** | Snackbar display and UNDO action | Universal POM | ✅ | ✅ |
| **TC-D05** | Date Picker — calendar view with OK, input mode with Cancel and OK, and calendar toggle | Multi-Modal | ✅ | ✅ |
| **TC-D05-NEG** | "Invalid format." error when submitting empty date input | Negative | ✅ | ✅ |
| **TC-D06** | Time Picker — analog dial mode with OK and Cancel, text input mode with OK and Cancel | Multi-Modal | ✅ | ✅ |
| **TC-D07** | Simple Dialog radio option selection for all colors | Universal POM | ✅ | ✅ |
| **TC-D08** | Full-Screen Dialog display, back navigation, and result card update | Universal POM | ✅ | ✅ |

> **Time Picker constraints:**
> - Analog dial: `android.widget.SeekBar` wrappers are read-only. Only canvas-tap at clock-angle position works. See `DialogsPage._tapDialAt` and `_dialGeometry`.
> - Text input: `EditText` fields drop keys via raw `setValue`. Use `DialogsPage.typeIntoEditText` (`click()` → `clearValue()` → `addValue()`).

## 5. Form Validation
| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-F01** | Form Validation page default state with all form fields | Universal POM | ✅ | ✅ |
| **TC-F02** | Submit successfully via the full happy path (Bridal/Large/2of5, 10:30 PM) | Universal POM | ✅ | ✅ |
| **TC-F03** | Reject Submit when Terms is OFF, then succeed after ticking Terms (consolidated) | Universal POM | ✅ | ✅ |
| **TC-F04** | Show all required-field error messages when submitting an empty form | Negative | ✅ | ✅ |
| **TC-F05** | Show format-error messages for invalid email/phone/number/password | Negative | ✅ | ✅ |
| **TC-F06** | Reset form state after Back-navigation and re-entry | Universal POM | ✅ | ✅ |

> **Note:** Date and Time pickers in Form Validation reuse the same dialog popups from Dialogs & Alerts. See section 4 for Date/Time interaction details.
> 
> **Error messages:** Name="Name is required", Email="Email is required" / "Enter a valid email", Phone="Phone is required" / "At least 10 digits", Number="Required" / "Enter 1-100", Password="Password is required" / "Min 6 characters", Category="Please select a category", Terms="Please accept the terms" (toast). Success toast: "Form submitted successfully!"
>
> **Field typing reliability (2026-05-12):** `typeIntoField` dismisses the soft keyboard after every field via `driver.hideKeyboard()`. While the keyboard is up, Flutter's semantic tree collapses unfocused EditTexts AND the scrollable container from the a11y bridge on slower CI emulators; the next field's `instance(N)` selector then resolves against a near-empty tree and can land on the wrong field. Input selectors are also wrapped in `UiScrollable.scrollIntoView` as defense-in-depth. See CLAUDE.md → "Form input fields — keyboard dismiss between fields" for the full diagnosis.
>
> **TC isolation (2026-05-12):** F02–F06 each self-reset via back+re-enter at the start of the TC. Cascading state across TCs proved fragile on slower CI emulators — a flake in F03 would cascade through F04/F05. Trade-off: ~+10s per TC for deterministic isolation.

## 6. Permissions
| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-P01** | Permissions page default state with all 3 entries "Not checked" + no "Open Settings" | Universal POM | ✅ | ✅ |
| **TC-P02** | Grant Camera (Video→While using, Audio→Deny→recover→One time→Granted), Location (While using), Storage (auto-grant) — verify persistence with re-navigation | Multi-Dialog Grant | ✅ | ✅ |
| **TC-P03** | Grant Camera (While using twice), Location (Only this time), Storage (auto-grant) — verify persistence | Alternative Grant + Persistence | ✅ | ✅ |
| **TC-P04** | Deny Camera twice (→Denied→Permanently Denied), deny Location twice (→Denied→Permanently Denied), auto-grant Storage — verify persistence with Request taps confirming no OS re-dialogs | Deny-2x + Persistence | ✅ | ✅ |

> **Native dialog handling:** Uses `resource-id` selectors from Android PermissionController (`permission_allow_foreground_only_button`, `permission_deny_button`, `permission_deny_and_dont_ask_again_button`). The 1st deny uses `permission_deny_button`; the 2nd deny (triggering "Permanently Denied") uses `permission_deny_and_dont_ask_again_button`. The POM selector uses `resourceIdMatches(".*permission_deny.*")` to match both variants.
> **API-level fallback (CI compatibility):** Retained from the prior API-29 CI baseline. `acceptWhileUsing()` and `acceptOneTime()` try the API-30-specific button first (5s timeout — bumped from 2s after CI migration to API 34, where the back-to-back Camera Video → Audio dialog pair needs more time for dialog #1 dismiss + dialog #2 render on a slower emulator), then fall back to the generic `PermissionController:id/permission_allow_button` selector for pre-API-30 emulators.
> **State management:** `beforeAll` calls `pm reset-permissions` to ensure clean "Not checked" state. Each individual test also resets before its own request to isolate side effects from prior test runs. `resetPermissions()` now force-stops the app before `am start -W` so reset reliably lands on Home rather than wherever the previous TC left the activity stack (without force-stop, `am start` brings the existing activity to foreground when the app is still running).
> **Scroll-safe persistence checks:** In TC-P02/P03/P04, Camera and Location statuses are verified *before* `scrollDownToStorageInfo()`. On API 29, scrolling pushes offscreen elements entirely out of the accessibility tree (not just visually), causing `element wasn't found` errors. Only Storage (below the fold) is checked after the scroll.
> **Note:** The three "Request" buttons share identical `content-desc` text (`"Request"`) and are differentiated via `.instance(0/1/2)` in order of appearance (Camera=0, Location=1, Storage=2).

## 7. Notifications
| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-NT01** | Accept OS dialog → card "Notification permission granted" → exercise all 5 triggers (Instant, Schedule, Banner DISMISS + VIEW, Dialog LATER + OK, Snackbar VIEW) | Universal POM + Helper | ✅ | ✅ |
| **TC-NT02** | Deny OS dialog → card "Permission denied — notifications may not appear" → exercise all 5 triggers | Universal POM + Helper | ✅ | ✅ |
| **TC-NT03** | Deny dialog twice (with leave+return between, since Android 13+ re-prompts once after a single deny) → 3rd entry has no dialog (permanent denial) → card reverts to "No notifications sent yet" → exercise all 5 triggers | Sequential Persistence | ✅ | ✅ |

> **API requirement:** Notifications module requires Android 13+ (API 33+) — `POST_NOTIFICATIONS` is an API-33 runtime permission. CI was migrated from API 29 → API 34 specifically to support this module; prior to migration the OS dialog never appeared and the entire flow was unreachable.
> **`pm clear` reset:** The DemoApp tracks "have we asked for POST_NOTIFICATIONS?" in SharedPreferences. `pm reset-permissions` clears OS-level grants and user_set flags but leaves the app's pref intact, so the dialog stays suppressed across runs. `resetNotificationPermission()` uses `pm clear` to wipe app data fully (heavyweight; only the Notifications module needs this) + `am start -W` (with a 2.5s settle pause) to relaunch reliably on both phone and tablet. Side effect: `pm clear` also wipes login state → spec's `gotoNotifications` re-authenticates via `LoginPage.login()` before nav.
> **Dialog a11y tree narrowing:** The in-app dialog (Show Dialog Notification → modal with OK/LATER) removes underlying page nodes from the accessibility tree while open (verified via UI dump). Card-status assertions for the dialog flow must happen *after* the dialog is dismissed — not while it's open. In-app banner and snackbar do NOT narrow the tree.
> **Card-status truth:** OK changes the card to "Dialog action tapped!"; LATER and scrim dismissal leave the card at "In-app dialog shown!" (no separate "dismissed" status). LATER vs scrim are indistinguishable by card text — TC-NT01 covers LATER as the "close-without-action" path; scrim is intentionally not tested (no unique state).
> **Pixel Tablet (emulator-5556, API 35) prerequisite:** Grant `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` to `io.appium.settings` before any test run — its ForegroundService is declared with type=location and crashes on API 34+ without those perms, breaking Appium session init.

## 8. Tabs & Navigation
| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-T01** | Default load — Back, title, 3 top tabs visible, Feed selected, Page 1 of 3 hint | UI Assertion | ✅ | ✅ |
| **TC-T02** | Feed pager — swipe 1→2→3, no overshoot past Page 3, swipe back to Page 2 preserved | Gesture + State | ✅ | ✅ |
| **TC-T03** | Search tab — selected state moves, static body text `Search Tab Content` shown | UI Assertion | ✅ | ✅ |
| **TC-T04** | Profile tab + nested bottom nav — Home/Favorites/Settings toggle, body text follows `<Name> Section` | UI Assertion | ✅ | ✅ |
| **TC-T05** | Cross-tab reset — Feed→Page 2 → Search → Feed → pager resets to Page 1 | State Reset | ✅ | ✅ |
| **TC-T06** | Back+re-enter reset — Feed→Page 3 → Back → re-enter via drawer → pager resets to Page 1 | State Reset | ✅ | ✅ |

> **Cascade flow:** Single `beforeAll` entry; TCs cascade in-screen (T01→T05) without exiting. Only TC-T06 deliberately leaves the page to test the back+re-enter reset path. TC-T05 explicitly taps Feed at start because TC-T04 leaves the screen on Profile/Settings.
> **Pager swipe geometry:** Horizontal swipe band at `y = height * 0.55` works on both phone and tablet — well below the top tab strip and above the bottom-nav region (Profile tab). No device-specific branch needed.

## 9. Camera
| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-CM01** | Grant Camera + Audio → live preview header, shutter, flip visible | Permission Flow + UI Assertion | ✅ | ✅ |
| **TC-CM02** | Tap shutter → "Photo Captured!" chip + transient toast matching `^Photo saved: CAP\d+\.jpg$` | Side-effect Capture | ✅ | ✅ |
| **TC-CM03** | Header Back arrow on captured state returns to live preview (intra-screen) | State Reset | ✅ | ✅ |
| **TC-CM04** | Tap flip-camera button → no crash, live preview UI intact (smoke; SurfaceView has no a11y diff between back/front cameras) | Smoke | ✅ | ✅ |
| **TC-CM05** | Deny camera dialog (single deny) → "Camera permission denied" + "Open Settings" | Permission Denial | ✅ | ✅ |
| **TC-CM06** | Deny twice with leave+return between → 3rd entry has no dialog (permanent denial) → denied state persists | Sequential Persistence | ✅ | ✅ |
| **TC-CM07** | Tap "Open Settings" from denied state → Android Settings (`com.android.settings`) is foreground app | Intent Verification | ✅ | ✅ |

> **Two-reset model:** Spec splits into Granted Path (CM01–CM04, one `pm clear` + one grant, cascade) and Denied Path (CM05–CM07, one `pm clear` + deny inline). Six per-test resets would burn ~2 min of overhead; this version completes in ~1.6 min.
> **`pm clear` reset:** Same rationale as Notifications — the DemoApp tracks the "asked Camera?" flag in SharedPreferences, so `pm reset-permissions` alone leaves the dialog suppressed across runs. `pm clear` wipes the flag + login state; spec re-authenticates via `LoginPage.login()`.
> **Camera screen NAF widgets:** Shutter (View), flip (Button), and the captured-state buttons are NAF=true with no `content-desc` / `resource-id` set at all. Selected by **clickable-instance order** (`UiSelector().clickable(true).instance(N)`): index 0 = header Back, 1 = shutter/back-arrow (state-dependent), 2 = flip. This is the most stable selector handle without dropping to coordinate taps.
> **Header Back arrow is context-aware:** In the captured-photo state it returns to live preview (intra-screen). In the live state it exits the Camera screen entirely. TC-CM03 exercises the captured→live transition. The bottom in-screen left button at `[160,2190][286,2316]` is likely retake/delete and is not part of our coverage.
> **Flip-camera tutorial overlay (emulator only):** First flip-to-front-camera on the Android Studio emulator injects an "Entering camera mode" tutorial modal. NOT a DemoApp UI element; on real devices it never appears. `CameraPage.dismissEmulatorTutorialIfPresent()` ticks "Don't remind again" and dismisses, gating the whole spec behind one no-op call on real devices.
> **Open Settings verification:** Uses `driver.getCurrentPackage()` (UiAutomator2 native) instead of `mobile: shell dumpsys` — the latter returns truncated output via Appium's shell channel.
> **CI render timing tuning:** Audio-dialog wait extended to 10s (was 5s) and `waitForPageLoad` requires both shutter and flip buttons to be visible before returning, not just the screen title. The Audio dialog appears slowest on the GHA API-34 emulator (5-10s after Camera grant); the flip button lands in the a11y tree a moment after the shutter on the same render path. Without these guards CI run 25734329420 raced and failed TC-CM01.

## 10. Location

| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-LO01** | Cold entry → OS Location dialog visible (While using / Don't allow) | Permission Flow | ✅ | ⏭ Skipped |
| **TC-LO02** | Grant "While using the app" → idle granted screen renders (Current Location card with Lat/Lng/Altitude/Speed/Accuracy + Refresh + Start Tracking) | UI Assertion | ✅ | ⏭ Skipped |
| **TC-LO03** | Tap Start Tracking → "Stop Tracking" + "Tracking location updates..." indicator + Location History with first entry matching `<lat>, <lng>\n<HH:mm:ss>\n±<n>m` | State Transition | ✅ | ⏭ Skipped |
| **TC-LO04** | 5 additional Start/Stop cycles → ≥ 6 total history entries (verify-and-retry per cycle), LIFO display order, end on stopped state (Start Tracking restored, indicator gone, Current Location card retained) | Accumulation + LIFO | ✅ | ⏭ Skipped |
| **TC-LO05** | Back to Home + re-enter Location → no OS dialog (permission persists); History is **screen-session-scoped** and resets to 0 entries; first fresh Start/Stop adds exactly 1 entry (pre-exit entries are NOT restored) | Persistence Contract | ✅ | ⏭ Skipped |
| **TC-LO06** | Single deny → "Location permission denied" + "Open Settings"; no Start Tracking / Current Location card | Permission Denial | ✅ | ⏭ Skipped |
| **TC-LO07** | Tap Open Settings → `getCurrentPackage()` reports `com.android.settings`; back to app → denied state retained | Intent Verification + Return State | ✅ | ⏭ Skipped |
| **TC-LO08** | Deny twice with leave+return between → 3rd entry has no dialog (permanent denial); denied state persists | Sequential Persistence | ✅ | ⏭ Skipped |

> **Pixel Tablet skip:** `width > 1200` in each describe's `beforeAll` invokes `test.skip` with a verbose reason. Verified manually that on emulator-5556 with OS-level "Allow only while using the app" + "Use precise location" set, the Location screen renders only the centered loading spinner — no Current Location card appears within 60s. Issue is the AVD's underlying location service, not Appium or the DemoApp.
> **Two-reset model:** Spec splits into Granted Path (LO01–LO05, one `pm clear` + grant once, cascade) and Denied Path (LO06–LO08, one `pm clear` + deny inline). Mirrors Camera's pattern.
> **`pm clear` reset:** Same rationale as Camera / Notifications — the DemoApp tracks the "asked Location?" flag in SharedPreferences. Wipes login; spec re-authenticates via `LoginPage.login()`.
> **History entry trigger:** Each Start Tracking tap inserts **exactly one** history entry provided GPS-fix dwell ≥ ~3s (`LocationPage.startDwellMs = 3500`). Refresh is a confirmed no-op on Android (does not modify Current Location or History). `cycleStartStop()` is verify-and-retry: it compares the newest entry's key before vs after each cycle and retries up to 3 times if the fix didn't land — necessary because the emulator GPS mock occasionally fails to return a fix within the dwell on cold sessions.
> **History display vs storage:** Entries are appended at the **top** (LIFO). The history list is a Flutter `ListView.builder`-style virtualized list — only ~5 entries render at a time on Pixel 8; older entries require scrolling. `collectAllHistoryEntries()` scroll-and-dedupes across the full list. No eviction was observed at ≤ 10 entries.
> **Screen-session scoping:** Exiting Location wipes the in-memory history. On re-entry the History section is not rendered until tracking is restarted; the first fresh Start adds exactly 1 entry. This is real app behavior, asserted by TC-LO05.
> **Nav drawer pre-swipe:** `gotoLocationFresh()` issues one explicit downward swipe inside the drawer before `navigateTo` — Location is the last TEST SCREENS item and sits at the drawer's bottom edge on smaller form factors. `NavMenuPage.scrollToItem` only scrolls when `isDisplayed=false`, so an item visible-but-clipped passes the gate and gets a partial-hit tap. The pre-swipe centres the target. Same drawer-column math as `NavMenuPage.scrollToItem`.
> **Open Settings verification:** Uses `driver.getCurrentPackage()`, identical to Camera. After return-from-Settings, TC-LO07 re-asserts the denied state to catch regressions where the deep-link incorrectly exits the app.

## 11. Dark Mode (cross-cutting smoke)

| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-DK01** | Default state at Home — drawer Dark Mode toggle reports `checked=false`. Capture 3-spot **light baseline** at AppBar coords. Toggle ON → `checked=true`; Home avg brightness drops by ≥ 80 vs baseline. | Theme Toggle + Baseline Capture | ✅ | ✅ |
| **TC-DK02** | Walk through every previously-tested page and verify each samples as dark (avg brightness < baseline − 80). Order: Catalog Landing → Shop All → Casual → Evening → Party → Boho → Cart → About (scroll → in-page Dark Mode Switch reports ON, synced with drawer) → Gestures → WebView (navigate-only, sample skipped) → Dialogs → Form → Permissions → Notifications → Tabs → Camera (deny dialog) → Location (deny dialog, Pixel 8 only). | Cross-Cutting Visual Smoke | ✅ | ✅ (Location step skipped) |
| **TC-DK03** | Toggle OFF via drawer → `checked=false`. Dismiss → Home avg brightness within ±30 of original baseline. | Restoration | ✅ | ✅ |

> **Sample geometry:** 3 points across the AppBar at fixed `Y = 0.07h` and `X = 0.6w / 0.75w / 0.9w` — right of any centered page title and, on Home, left of the cart icon. AppBar background is uniformly theme-aware on every screen; page-body sampling was abandoned because Catalog Landing's product imagery has dark colors even in light mode (initial baseline read 94 instead of the AppBar's 247).
> **WebView sampling skipped:** The inner WebView content is web-themed, not app-themed. We still navigate in/out to confirm no crash under dark theme.
> **About in-page toggle sync:** The About page exposes its own Dark Mode Switch (`AboutPage.darkModeSwitch`). Manually verified that flipping the drawer toggle also flips the in-page Switch; TC-DK02 asserts this state-sync after a `scrollToBottom()`.
> **Location step on tablet:** Skipped per the 10/Location module's tablet limitation. The rest of DK02 runs identically on both devices.
> **Single drawer trip per TC:** The original `beforeAll` "normalize to OFF" step was dropped because DK03 already leaves Dark Mode OFF at the end of every clean run. DK01 enters at default OFF; if a prior run was interrupted mid-walk and left dark ON, the first `expect(checked === false)` in DK01 fails clearly — surfacing the leak rather than silently masking it.
> **Location pre-swipe:** Mirrored from `10_location.spec.js` — one drawer-column swipe before tapping Location so the tap target is centred instead of clipped at the drawer's bottom edge.
> **Retry-tolerant returnHome:** `driver.back()` is called up to 3 times waiting for Home's `shopAllBtn`. Some module screens (Form's auto-focused EditText) raise the soft keyboard and the first back dismisses the keyboard rather than exiting the page; the retry absorbs this without per-module branching.

## 12. Product Detail + Add to Cart (planned)

**Spec:** `tests/specs/04_products/01_product_detail_add.spec.js`
**Flow:** Shop All → Detail (color-variant add ×2) → Casual Category → Detail (add) → Evening Category → direct add. Cart cascade ends with 4 lines.

**Color → cart line model (verified from `dumps/cart_with_items.xml`):**
- Different color on same product → new cart line (variant model).
- Same color on same product tapped again → qty bump on existing line.
- Cart line content-desc has NO color info — only `name\n$total\nqty`. Two color variants of one product produce two identical-looking lines in the a11y tree, distinguishable only by positional instance.

**Add-to-cart snackbar (verified from `dumps/detail_add_toast.xml`):**
- `description="<Product> added to cart"` with embedded `VIEW CART` action button @ bottom edge.
- Detail screen app bar has no cart icon — badge assertion requires navigating back to Shop All / Category grid where the cart icon sits.

| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-PD01** | From Catalog Landing → Shop All → tap random product card → Detail renders (image, title, price, description, 3 color swatches, qty stepper, Add to Cart) | E2E Flow | ✅ | ✅ |
| **TC-PD02** | Color-variant cascade — tap color swatch by instance(0) → Add to Cart → snackbar; tap swatch by instance(1) on same product → Add to Cart → snackbar. Assert Cart now has 2 lines (one per color variant) and badge=2 | UI Interaction + Variant Side-effect | ✅ | ✅ |
| **TC-PD03** | Back → assert cart badge=2 on Shop All; Nav Menu → Home → tap Casual category → tap random product card → Detail renders (navigation-only, no add) | E2E Flow | ✅ | ✅ |
| **TC-PD04** | Tap Add to Cart on the Casual product Detail → snackbar `"<Product> added to cart"` with VIEW CART action; navigate Back → cart badge=3 | UI + Side-effect | ✅ | ✅ |
| **TC-PD05** | Back → Evening category landing renders with product grid (navigation-only, no add) | E2E Flow | ✅ | ✅ |
| **TC-PD06** | Add a product directly via the card's NAF add-to-cart icon (no Detail visit) → snackbar at bottom edge → cart badge=4 | UI + Side-effect | ✅ | ✅ |

> **Cross-device:** Pixel Tablet runs in **forced portrait** for this spec — natural landscape (2560×1600) makes product cards taller than the viewport. Lock is applied AFTER login via `mobile: shell` + `settings put system user_rotation 1`. The W3C `driver.setOrientation()` is deprecated and silently no-ops on UIA2; `mobile: setOrientation` is not registered. See `feedback_uia2_orientation_api.md` in memory.

## 13. Search (planned)

**Spec:** lives in `tests/specs/04_products/01_product_detail_add.spec.js` (folded with PD).
**Scope:** Search bar is NOT on Catalog Landing — it lives on the Shop All ("All Dresses") grid and each Category grid (Casual / Evening / Party / Boho). TC-SR01 exercises **Party** with keyword `"Cocktail"` (3 matches: Lace, Mint, Navy) and adds all 3; TC-SR02 exercises **Boho** with `"shorts"` for an off-catalog clothing-domain negative.

| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-SR01** | Open Party grid → search `"Cocktail"` → counter shows 3 matches → add all 3 distinct cocktail products via direct-add icon (bottom-up scroll pattern); cart badge becomes 7 | Functional + Multi-Add | ✅ | ✅ |
| **TC-SR02** | Open Boho grid → search `"shorts"` → zero matching cards, badge unchanged at 7 | Negative (cross-grid) | ✅ | ✅ |

> **Bottom-up scroll pattern (SR01):** scroll the grid DOWN once so the bottom-most match is in view, then iterate visible names in REVERSE order. Between iterations, scroll UP to reveal earlier matches. The inter-iteration scroll doubles as the snackbar-dismiss delay — Material Snackbar with `VIEW CART` action persists ≥5s on rotated tablet, exceeding `waitForSnackbarDismissed`'s default budget. Phone case (all 3 fit in one viewport) degenerates cleanly to one iteration. See `feedback_bottom_up_scroll_pattern.md`.

## 14. Shopping Cart (planned)

**Spec:** `tests/specs/04_products/02_cart.spec.js`
**Cascade entry:** assumes 4 cart lines from §12 (2 color variants + 1 Casual + 1 Evening). Increment cap N=5 (matches Location's cycle budget).

**Cart line structure (verified from `dumps/cart_with_items.xml`):**
- Each line = ImageView with `description="<Product>\n$<line total>\n<qty>"` (qty 1 ⇒ qty 1, qty 2 ⇒ price doubled and qty shown as 2).
- Per line, 3 buttons in left-to-right order (selectable via `clickable(true).instance(N)` within the line subtree, or via bounds):
  - **Minus** — `enabled=false, clickable=false` at qty=1 (greyed); becomes NAF `clickable=true` at qty≥2.
  - **Plus** — NAF Button, always `clickable=true`.
  - **Delete** — NAF Button, always `clickable=true`.
- **Selector ambiguity:** color variants of the same product produce identical content-desc lines. Disambiguate by positional instance within the scrollable, not by content-desc.

**Bottom bar:**
- Label `description("Total:")`, value `description("$<sum>")` (sum of all line totals).
- `description("Proceed to Checkout")` Button, clickable=true.

| Test ID | Description | Strategy | Status |
| :--- | :--- | :--- | :---: |
| **TC-S01** | Open Cart (icon) → 4 line items visible with correct `name\n$total\nqty` content-desc; `Total:` value = Σ line totals; Proceed to Checkout enabled | Universal POM + Data Integrity | ⏳ |
| **TC-S02** | On a qty=1 line, tap Plus up to qty=5 → line content-desc reflects new qty + scaled total per tap; cart Total updates per tap | UI Interaction (capped N=5) | ⏳ |
| **TC-S03** | Tap Minus back down to qty=1 → totals reverse symmetrically; at qty=1 the Minus button is disabled (`enabled=false, clickable=false`) — assertion only, no further tap | UI Interaction + Disabled-state Assertion | ⏳ |
| **TC-S04** | Tap Delete (3rd clickable instance per line) on a specific line → that line removed, cart Total decrements by the deleted line's total, remaining lines unchanged | UI Interaction | ⏳ |
| **TC-S05** | Tap Delete on remaining lines until empty → empty-state message ("Your Cart is empty"), badge=0, Continue Shopping button visible | Negative / Empty State | ⏳ |

## 15. Checkout (planned)

**Spec:** `tests/specs/04_products/03_checkout.spec.js`
**Flow:** Cart → Shipping Info ("To Payment") → Review Order ("Place Order") → Thank You ("Continue Shopping"). No Payment step. No order number on Thank You. Fields accept any non-empty value (no format validation observed). Test data: `tests/data/checkout-scenarios.json`.

**Selectors (verified from `dumps/shipping_info.xml`, `dumps/shipping_empty_submit.xml`, `dumps/review_order.xml`, `dumps/thank_you.xml`):**
- Shipping Info form: 7 NAF `EditText` fields, no hint/resource-id. Positional `instance(N)` is the only selector handle (0=Full Name, 1=Address1, 2=Address2 optional, 3=City, 4=State, 5=Zip, 6=Country). Same a11y model as Form Validation — port `typeIntoField` with `hideKeyboard()` + `UiScrollable.scrollIntoView`.
- Validation: every required field gets a child View `description="This field is required"` after empty submit; Address 2 stays clean.
- Review Order: Shipping Address card content-desc joins fields with `\n` — 4 lines without Address 2, **5 lines with Address 2** (`Full Name\nAddress 1\nAddress 2\nCity, State Zip\nCountry`).
- Review line item format: `description="<Product>\nQty: <N>\n$<line subtotal>"` — same data semantic as Cart (subtotal, not unit price) but different field order, so the POM needs two parsers (one for `<Product>\n$<total>\n<qty>` on Cart, one for `<Product>\nQty: <N>\n$<subtotal>` on Review).
- Review scrollability: when total content fits viewport, no scroll wrapper. When content overflows (verified at 6 line items), entire screen wraps in `android.widget.ScrollView` with `scrollable=true` and **Place Order falls below the fold**. POM must use `UiScrollable.scrollIntoView` for `description("Place Order")` on long carts.
- Thank You: `description("Thank You!")` + body `description="Your order has been placed successfully.\nYou will receive a confirmation shortly."` + `description("Continue Shopping")` button. No app bar, no Back — Continue Shopping is the only forward path.

| Test ID | Description | Strategy | Status |
| :--- | :--- | :--- | :---: |
| **TC-K01** | Cart with ≥ 1 item → Checkout → Shipping Info renders (7 fields) → tap To Payment with all fields empty → assert exactly 6 `"This field is required"` errors (one per required field; Address 2 has none); stay on Shipping | Negative | ⏳ |
| **TC-K02** | Fill all 7 Shipping fields (`valid[0]` fixture including Address 2 = "Unit 04-12") → To Payment → Review Order renders with **5-line Shipping Address card** (proves Address 2 is rendered as its own line), Order Summary line items match Cart, Total matches Cart Total → Place Order → Thank You screen with `"Thank You!"` title + success body + Continue Shopping button | E2E Flow + Optional Field Surface | ⏳ |
| **TC-K03** | Continue Shopping from Thank You → returns to Catalog Landing → cart badge=0 | E2E Flow | ⏳ |
| **TC-K04** | Fill all 7 Shipping fields → To Payment (Review renders) → tap Back → Shipping Info re-appears with **all 7 entered values preserved** verbatim (incl. Address 2) | State Preservation | ⏳ |

## 16. End-to-End Regression (planned)

**Spec:** `tests/specs/05_regression/01_e2e.spec.js`
**Reset:** `pm clear` + `am force-stop` + `am start -W` (matches Camera/Location/Notifications pattern). CI-safe — proven in commit `b383803` (run 25852952799).

| Test ID | Description | Strategy | Status |
| :--- | :--- | :--- | :---: |
| **TC-E01** | Full serial single-product journey: `pm clear` → relaunch → login → Catalog Landing → product detail → add to cart → open Cart → Checkout → fill Shipping (standard fixture) → To Payment → Review Order → Place Order → Thank You → Continue Shopping → assert Catalog Landing + badge=0 | Full E2E Serial | ⏳ |
