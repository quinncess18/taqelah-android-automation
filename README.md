# Taqelah Mobile Automation Framework

Production-grade automation framework for the **Taqelah Boutique** Flutter application. This project uses a hybrid architecture combining **Playwright** for test orchestration and **Appium (WebdriverIO)** for mobile interaction, with cross-platform Android + iOS as the design goal.

## 🏁 Current Status: Modules 1–3 Verified on Pixel 8 + Pixel Tablet

- **Module 1 (Authentication):** ✅ TC-L01–L06, TC-N01–N03 — Pixel 8 + Pixel Tablet.
- **Module 2 (Catalog):** ✅ TC-C01–C11 — Pixel 8 + Pixel Tablet.
- **Module 3 (Navigation & Gestures):** ✅ TC-M01–M08 — Pixel 8 + Pixel Tablet.
- **WebView (In-App Browser):** ✅ TC-W01–W03 — Pixel 8 + Pixel Tablet.
- **Dialogs & Alerts:** ✅ TC-D01–D08, TC-D05-NEG — Pixel 8 + Pixel Tablet.
- **Form Validation:** ✅ TC-F01–F06 — Pixel 8 + Pixel Tablet.
- **Permissions:** ✅ TC-P01–P04 — Pixel 8 + Pixel Tablet (with transitional-state auto-wait for Location's "Getting location..." status resolution, force-stop + `am start -W` in `resetPermissions()`, 5s primary dialog timeout for the back-to-back Camera Video → Audio sequence on slower emulators, and scroll-safe persistence checks).
- **Notifications:** ✅ TC-NT01–NT03 — Pixel 8 + Pixel Tablet. Covers OS dialog Allow / Don't allow / Permanent denial (2× deny → suppressed dialog → card reverts to "No notifications sent yet"). Shared `exerciseAllTriggers()` POM helper exercises system notifications (Instant, Schedule), in-app banner (DISMISS, VIEW), in-app dialog (LATER, OK), and in-app snackbar (VIEW). Uses `pm clear` reset (the DemoApp tracks "have we asked POST_NOTIFICATIONS?" in SharedPreferences — `pm reset-permissions` alone is insufficient); spec re-authenticates after `pm clear` wipes login state.
- **Tabs & Navigation:** ✅ TC-T01–T06 — Pixel 8 + Pixel Tablet. Covers top tab strip (Feed pager / Search static / Profile nested bottom nav), Feed pager swipe bounds (1→2→3, no overshoot, back-swipe preserves intra-tab state), Profile's Home/Favorites/Settings toggle with `<Name> Section` body text, and pager state reset on cross-tab hop and screen exit. Cascade flow — single `beforeAll` entry, T01–T05 stay in-screen; only TC-T06 deliberately leaves the page to verify back+re-enter reset.
- **Camera:** ✅ TC-CM01–CM07 — Pixel 8 + Pixel Tablet. Two-reset spec: Granted Path (CM01–CM04) covers live preview shutter + flip + "Photo Captured!" chip + `Photo saved: CAP<id>.jpg` toast + captured→live header-back-arrow transition; Denied Path (CM05–CM07) covers single deny → "Camera permission denied" + "Open Settings", 2× deny → permanent denial dialog suppression, and Open Settings deep-link to Android Settings via `driver.getCurrentPackage()`. Flutter camera widgets are NAF=true with no content-desc/resource-id, so selectors anchor on clickable-instance order (header Back=0, shutter/back-arrow=1, flip=2). Emulator's "Entering camera mode" tutorial dismissed via `CameraPage.dismissEmulatorTutorialIfPresent()` — no-op on real devices.
- **Location:** ✅ TC-LO01–LO08 — Pixel 8 only (Pixel Tablet skipped: emulator-5556 GPS provider does not emit fixes within practical timeouts, so the Current Location card never renders; OS-level permission is granted but the AVD's underlying location service is silent — confirmed by manual verification with "Allow only while using" + "Use precise location" set). Two-reset spec: Granted Path (LO01–LO05) covers cold-entry OS dialog, "While using" grant → idle granted screen, Start Tracking → tracking state + first history entry, 5 additional Start/Stop cycles → ≥ 6 history entries with LIFO display order + verify-and-retry cycle helper, and re-entry persistence (permission persists, history is screen-session-scoped and resets); Denied Path (LO06–LO08) covers single deny → "Location permission denied" + "Open Settings", Open Settings deep-link with return-state assertion, and 2× deny → permanent denial suppression. History list is a Flutter `ListView.builder`-style virtualized list (~5 entries visible at a time on phone; older entries require scroll); `collectAllHistoryEntries()` scroll-and-dedupes. No eviction observed at ≤ 10 entries.
- **Dark Mode (cross-cutting smoke):** ✅ TC-DK01–DK03 — Pixel 8 + Pixel Tablet. Visits every previously-tested page after toggling the drawer's Dark Mode setting ON and asserts each samples as dark (3-spot AppBar pixel sampling vs a light baseline captured pre-toggle, delta ≥ 80). Walk order: Catalog Landing → Shop All → Casual → Evening → Party → Boho → Cart → About (scroll → asserts the in-page Dark Mode Switch is also ON, synced with the drawer) → Gestures → WebView (navigate-only, sample skipped — web content not app-themed) → Dialogs → Form → Permissions → Notifications → Tabs → Camera (deny dialog) → Location (deny dialog, Pixel 8 only). DK03 toggles OFF and verifies Home returns to within ±30 of baseline. Includes Location pre-swipe (drawer-edge tap avoidance, mirrored from 10/Location) and retry-tolerant `returnHome` (back-button retried up to 3× to absorb Form's soft-keyboard dismissal).
- **Products — Product Detail + Add to Cart + Search:** ✅ TC-PD01–PD06 + TC-SR01–SR02 — Pixel 8 + Pixel Tablet (tablet rotated to portrait via `mobile: shell user_rotation=1` post-login; W3C `setOrientation` is a no-op on UIA2). Cross-cutting cascade: Shop All → Detail → 2 color variants → Casual category → Detail (add) → Evening category → direct-add via card icon → Party search "Cocktail" → add all 3 cocktail matches → Boho search "shorts" → empty state. Ends with cart badge=7. SR01 uses bottom-up scroll pattern (scroll down first, iterate matches in reverse) to absorb the Snackbar's ≥5s VIEW CART persistence. POMs: `ProductDetailPage`, `ProductGridPage` (gains `cartBadge`/search/direct-add helpers), `CartPage` (gains `lineItem`/`getLineCount`); snackbar helpers + `attrName` promoted to `BasePage`. No orientation revert in `afterAll` — Cart (§14) chains off this state.
- **Cart (§14) — Add/Update/Delete + Empty State:** ✅ TC-S01–S05 — Pixel 8 + Pixel Tablet. Chains off Products' 7-line end-state by tapping the grid cart icon (no in-spec cascade rebuild). TC-S01 walks the cart ScrollView via `CartPage.collectAllLines()` (snapshot + stitch — handles Compose virtualisation on phone where lines 7+ are off-screen; tablet portrait fits all 7 in viewport and the walk no-ops). TC-S02/S03 drive Plus/Minus on line 0 (qty 1↔5 capped), asserting per-tap line total and Σ(line totals) == bottom-bar cart total via in-code computation. TC-S04 deletes one line and verifies count-1 + total decrement + Σ math. TC-S05 deletes until empty → "Your cart is empty" + Continue Shopping visible. Per-line buttons are NAF (no content-desc); resolved via direct `.click()` on the line ImageView's Button children in DOM order [Minus, Plus, Delete] — sidesteps the duplicate-content-desc problem with PD02 color variants. Cart's `afterAll` reverts the tablet to landscape at end of the 04_products chain.
- **Checkout (§15) — Empty Submit + Happy Path + State Preservation:** ✅ TC-K01–K04 — Pixel 8. Chains off Cart's empty-state by tapping Continue Shopping → Boho grid; `gridPage.clearSearch()` drops the §13 "shorts" filter; `beforeAll` adds 2–3 distinct random Boho items via the Detail-page add path (PD04 pattern) since direct-add icons collided with the Material snackbar overlay on bottom-of-grid cards. TC-K01 taps To Payment with empty form → 6 required-field errors (Address 2 optional). TC-K02 fills `valid[0]` fixture (Jane Doe + Unit 04-12) → Review renders with 5-line Shipping Address card → Order Summary line items match Cart by name+qty+total → Review Total = Cart Total → Place Order → Thank You with title + body + Continue Shopping. TC-K03 taps Continue Shopping → Catalog Landing + cart badge node absent. TC-K04 has its own pre-step (random non-Boho category → Detail-path add 2 items → Cart → Shipping), fills `valid[0]` → To Payment → Review → Back → Shipping re-appears with all 7 field values preserved verbatim. New POMs: `ShippingInfoPage` (UiScrollable EditText fields, typeInto/fillForm/readForm), `ReviewOrderPage` (Shipping Address line parsing + Order Summary line items via `View + descriptionContains("Qty:")`), `ThankYouPage`.

- **Upcoming:** §16 End-to-End regression (TC-E01) → §0 Smoke (login + catalog + 1-item add, sub-90s) for daily fast sanity. Real-device cloud for full Location coverage (mock-location injection or LambdaTest/Firebase Test Lab) — emulator GPS is unreliable across AVDs.


## 🚀 Key Features
- **Cross-Platform-Ready Architecture:** Codebase designed for both Android and iOS targets. Currently verified on Android emulators (Pixel 8, Pixel Tablet); iOS device profiles (iPhone 15 Pro, iPad) scaffolded for post-workshop integration.
- **Safe-Zone Gestures:** Device-agnostic logic using a **30% width safe zone**, avoiding all system handles and split-view triggers on wide screens.
- **Cross-Platform POMs:** Intelligent Page Objects using the "Ternary Selector" pattern to bridge Android and iOS Flutter TestKeys.
- **Sequential Cross-Device Execution:** `workers: 1` in `playwright.config.js` runs each device project (Pixel 8, Pixel Tablet) sequentially — avoids Appium port collisions and UIAutomator2 session crashes.
- **Scalable Architecture:** Module-first directory structure designed for large-scale E2E coverage.
- **Flutter-First Strategy:** Optimized stability pauses specifically for Flutter's high-momentum accessibility tree.

## 🏗️ Project Structure
```text
├── apps/                 # Application binaries (.apk, .app)
├── config/               # Device (Android/iOS) and Appium server configurations
├── fixtures/             # Playwright custom fixtures (Dynamic Driver switching)
├── tests/
│   ├── data/             # Static test data (products.js)
│   ├── pages/            # Page Object Models (Cross-Platform Selectors)
│   └── specs/            # Test suites organized by module
│       ├── 01_auth/      # Authentication & Security tests
│       ├── 02_catalog/   # Home, Grid, Categories
│       ├── 03_nav/       # Navigation routing & Gestures
│       └── 04_products/  # Product Detail, Add to Cart, Search
└── playwright.config.js  # Main configuration for the test runner
```

## 🛠️ Tech Stack

- **Test Runner:** [Playwright Test](https://playwright.dev/)
- **Mobile Driver:** [Appium 2.x](https://appium.io/)
- **Client Library:** [WebdriverIO 8.x](https://webdriver.io/)
- **Android Driver:** `uiautomator2` (installed)
- **iOS Driver:** `xcuitest` (planned — pending integration after June workshop)

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Android SDK & ADB
- Appium 2.x server with `uiautomator2` driver
- An active Android emulator or physical device

### Installation
```bash
npm install
```

### Running Tests
```bash
# 1. Start Appium (required before any test run)
npm run appium:start

# 2. Run all tests (sequential across configured devices, single worker)
npm test

# Module-specific runs
npm run test:login         # 01_auth/01_functional.spec.js
npm run test:login:neg     # 01_auth/02_negative.spec.js
npm run test:catalog       # 02_catalog/01_landing.spec.js
npm run test:categories    # 02_catalog/02_categories.spec.js
npm run test:nav           # 03_nav/01_main_nav.spec.js
npm run test:gestures      # 03_nav/02_gestures.spec.js
npm run test:webview       # 03_nav/03_webview.spec.js
npm run test:dialogs       # 03_nav/04_dialogs.spec.js
npm run test:form          # 03_nav/05_form.spec.js
npm run test:permissions   # 03_nav/06_permissions.spec.js
npm run test:notifications # 03_nav/07_notifications.spec.js
npm run test:tabs          # 03_nav/08_tabs.spec.js
npm run test:camera        # 03_nav/09_camera.spec.js
npm run test:location      # 03_nav/10_location.spec.js (Pixel 8 only — tablet auto-skipped)
npm run test:darkmode      # 03_nav/11_dark_mode.spec.js (cross-cutting smoke; Location step tablet-skipped)
npm run test:products      # 04_products/01_product_detail_add.spec.js (tablet auto-rotates to portrait post-login)
npm run test:cart          # 04_products/02_cart.spec.js — requires test:products to have just run in the same worker

# Single spec against a specific device

npx playwright test tests/specs/01_auth/01_functional.spec.js --project="Pixel 8 (Local)"


# Single TC by ID
npx playwright test --project="Pixel 8 (Local)" -g "TC-L01"
```

## 🎯 Per-Module API Compatibility

Each module declares its supported Android API range as an explicit contract.

| Module | Min API | Notes |
|---|---|---|
| Auth, Catalog, Nav Main, Gestures, WebView, Dialogs, Form, Permissions, Tabs | 29 | All version-gated paths have fallbacks (e.g. PermissionsPage's API-29 AOSP UI selectors). |
| Camera | 30 | Uses Android 11+ foreground-only permission dialog; API 29 fallbacks not retained. |
| **Notifications** | **33** | `POST_NOTIFICATIONS` is API 33+. CI MUST run API 33+ for this module to verify. |
| **Location** | 29 | No version-gated APIs. Pixel Tablet AVD runtime-skipped (`width > 1200`) — emulator-5556's GPS provider does not emit fixes. Module runs on Pixel 8 + CI Pixel 6 only until mock-location injection or real-device cloud is wired. |
| **Dark Mode** | 29 | Cross-cutting smoke. Inherits 10/Location's tablet-skip for the Location step only; rest of the walk runs on both devices. |
| **Products (04/01)** | 29 | No version-gated widgets. Pixel Tablet runs in **forced portrait** — orientation lock applied AFTER login via `mobile: shell` + `settings put system user_rotation 1`. Without rotation, Pixel Tablet's natural landscape makes product cards taller than the viewport and NAF add-to-cart child Buttons don't enter the a11y tree. |
| **Cart (04/02)** | 29 | Inherits Products' portrait lock (Products' `afterAll` no longer reverts). Cart's `afterAll` performs the end-of-chain revert. Per-line buttons are NAF + duplicate content-desc (PD02 variants) → resolved via direct `.click()` on the line ImageView's Button children. |
| **Checkout (04/03)** | 29 | Chains off Cart's empty-state. Adds 2–3 distinct random items via Detail-page add (snackbar overlay made grid direct-add unreliable). Shipping fields are NAF EditTexts via UiScrollable instance(0–6); Review line items are `View + descriptionContains("Qty:")` (different class than Cart's `ImageView` lines). |

See `TEST_PLAN.md → API Compatibility Matrix` for the operating contract (how to declare modules, what to do when bumping CI API).

## 📝 Documentation
- [TEST_PLAN.md](./TEST_PLAN.md): Current test coverage, per-device verification status, and the per-module API compatibility matrix.
