# Taqelah Mobile Automation Framework

Production-grade automation framework for the **Taqelah Boutique** Flutter application. This project uses a hybrid architecture combining **Playwright** for test orchestration and **Appium (WebdriverIO)** for mobile interaction, with cross-platform Android + iOS as the design goal.

## 🏁 Current Status: Modules 1–3 Verified on Pixel 8 + Pixel Tablet

- **Module 1 (Authentication):** ✅ TC-L01–L06, TC-N01–N03 — Pixel 8 + Pixel Tablet.
- **Module 2 (Catalog):** ✅ TC-C01–C11 — Pixel 8 + Pixel Tablet.
- **Module 3 (Navigation & Gestures):** ✅ TC-M01–M08 — Pixel 8 + Pixel Tablet.
- **WebView (In-App Browser):** ✅ TC-W01–W03 — Pixel 8 + Pixel Tablet.
- **Dialogs & Alerts:** ✅ TC-D01–D08, TC-D05-NEG — Pixel 8 + Pixel Tablet.
- **Form Validation:** ✅ TC-F01–F06 — Pixel 8 + Pixel Tablet.
- **Permissions:** ✅ TC-P01–P04 — Pixel 8 + Pixel Tablet (with transitional-state auto-wait for Location's "Getting location..." status resolution).


- **Upcoming:** Module 7 (Shopping Cart), Module 8 (Checkout).
- **Roadmap:** iOS platform support (iPhone 15 Pro, iPad) post-June workshop.


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
npm run test:permissions    # 03_nav/06_permissions.spec.js

# Single spec against a specific device

npx playwright test tests/specs/01_auth/01_functional.spec.js --project="Pixel 8 (Local)"


# Single TC by ID
npx playwright test --project="Pixel 8 (Local)" -g "TC-L01"
```

## 📝 Documentation
- [TEST_PLAN.md](./TEST_PLAN.md): Current test coverage and per-device verification status.
