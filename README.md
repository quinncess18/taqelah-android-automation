# Taqelah Mobile Automation Framework

Enterprise-grade automation framework for the **Taqelah Boutique** Flutter application. This project uses a hybrid architecture combining **Playwright** for test orchestration and **Appium (WebdriverIO)** for cross-platform mobile interaction.

## 🚀 Key Features
- **Dual-Platform Ready:** Refactored architecture supporting both Android and iOS from a single codebase.
- **Scalable Architecture:** Module-first directory structure designed for large-scale E2E coverage.
- **Flutter-First Strategy:** Optimized selectors (Ternary Pattern) and stability pauses specifically for Flutter's accessibility tree.
- **Self-Healing State Management:** Framework-level logic to ensure tests start from a clean state (Login) regardless of previous run outcomes.
- **CI/CD Ready:** Integrated with Playwright workers and ADB-based global setup for predictable CI runs.

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
- **Android Driver:** `uiautomator2`
- **iOS Driver:** `XCUITest`

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
