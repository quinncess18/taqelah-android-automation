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
- **Camera:** ✅ TC-CM01–CM07 — Pixel 8 + Pixel Tablet. Two-reset spec: Granted Path (CM01–CM04) covers live preview shutter + flip + "Photo Captured!" chip + `Photo saved: CAP<id>.jpg` toast + captured→live header-back-arrow transition; Denied Path (CM05–CM07) covers single deny → "Camera permission denied" + "Open Settings", 2× deny → permanent denial dialog suppression, and Open Settings deep-link to Android Settings via `driver.getCurrentPackage()`. Compose camera widgets are NAF=true with no content-desc/resource-id, so selectors anchor on clickable-instance order (header Back=0, shutter/back-arrow=1, flip=2). Emulator's "Entering camera mode" tutorial dismissed via `CameraPage.dismissEmulatorTutorialIfPresent()` — no-op on real devices.

- **Upcoming:** Location (`03_nav/10_location`). Requires real-device cloud (LambdaTest / Firebase Test Lab) for meaningful coverage — emulator GPS is mocked.


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
│       └── 03_nav/       # Navigation routing & Gestures
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

See `TEST_PLAN.md → API Compatibility Matrix` for the operating contract (how to declare modules, what to do when bumping CI API).

## 📝 Documentation
- [TEST_PLAN.md](./TEST_PLAN.md): Current test coverage, per-device verification status, and the per-module API compatibility matrix.
