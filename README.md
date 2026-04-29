# Taqelah Mobile Automation Framework

Production-grade automation framework for the **Taqelah Boutique** Flutter application. This project uses a hybrid architecture combining **Playwright** for test orchestration and **Appium (WebdriverIO)** for mobile interaction, with cross-platform Android + iOS as the design goal.

## 🏁 Current Status: Module 2 COMPLETE (Android)

- **Module 1 (Authentication):** ✅ Verified on Android emulators (Pixel 8, Pixel Tablet).
- **Module 2 (Catalog):** ✅ Verified on Android emulators (incl. 32-item data integrity audit across four dress categories).
- **Upcoming:** **Module 3 (Navigation & Utility)** — POM scaffolding and core scenarios.
- **Roadmap:** Module 4 (Shopping Cart), Module 5 (Checkout), and iOS platform support post-June workshop.

## 🚀 Key Features
- **Cross-Platform-Ready Architecture:** Codebase designed for both Android and iOS targets. Currently verified on Android emulators (Pixel 8, Pixel Tablet); iOS device profiles (iPhone 15 Pro, iPad) scaffolded for post-workshop integration.
- **Safe-Zone Gestures:** Device-agnostic logic using a **30% width safe zone**, avoiding all system handles and split-view triggers on wide screens.
- **Cross-Platform POMs:** Intelligent Page Objects using the "Ternary Selector" pattern to bridge Android and iOS Flutter TestKeys.
- **Parallel Cross-Device Support:** Simultaneous execution across multiple devices using Playwright workers.
- **Scalable Architecture:** Module-first directory structure designed for large-scale E2E coverage.
- **Flutter-First Strategy:** Optimized stability pauses specifically for Flutter's high-momentum accessibility tree.

## 🏗️ Project Structure
```text
├── apps/                 # Application binaries (.apk, .app)
├── config/               # Device (Android/iOS) and Appium server configurations
├── fixtures/             # Playwright custom fixtures (Dynamic Driver switching)
├── tests/
│   ├── pages/           # Page Object Models (Cross-Platform Selectors)
│   ├── specs/           # Test suites organized by module
│   │   ├── 01_auth/     # Authentication & Security tests
│   │   └── 02_catalog/  # Home & Product Grid tests
│   └── utils/           # Shared utilities (Gestures, Logger)
├── global-setup.js       # CI/CD state reset logic
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
# Start Appium
npm run appium:start

# Run all tests
npm test

# Run Authentication module only
npm run test:login
```

## 📝 Documentation
- [TEST_PLAN.md](./TEST_PLAN.md): Current test coverage and verification status.
