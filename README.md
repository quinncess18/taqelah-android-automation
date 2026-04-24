# Taqelah Android Automation Framework

Enterprise-grade automation framework for the **Taqelah Boutique** Flutter application. This project uses a hybrid architecture combining **Playwright** for test orchestration and **Appium (WebdriverIO)** for mobile interaction.

## 🚀 Key Features
- **Scalable Architecture:** Module-first directory structure designed for large-scale E2E coverage.
- **Flutter-First Strategy:** Optimized selectors and stability pauses specifically for Flutter's accessibility tree.
- **Self-Healing State Management:** Framework-level logic to ensure tests start from a clean state (Login) regardless of previous run outcomes.
- **CI/CD Ready:** Integrated with Playwright workers and ADB-based global setup for predictable CI runs.
- **Cross-Device Parallelism:** Configured to run across multiple physical devices or emulators simultaneously.

## 🏗️ Project Structure
```text
├── apps/                 # Application binaries (.apk)
├── config/               # Device and Appium server configurations
├── fixtures/             # Playwright custom fixtures (Appium driver initialization)
├── tests/
│   ├── pages/           # Page Object Models (POM)
│   ├── specs/           # Test suites organized by module
│   │   └── 01_auth/     # Authentication & Security tests
│   └── utils/           # Shared utilities (Gestures, Logger)
├── global-setup.js       # CI/CD state reset logic
└── playwright.config.js  # Main configuration for the test runner
```

## 🛠️ Tech Stack
- **Test Runner:** [Playwright Test](https://playwright.dev/)
- **Mobile Driver:** [Appium 2.x](https://appium.io/)
- **Client Library:** [WebdriverIO 8.x](https://webdriver.io/)
- **Language:** JavaScript (Node.js)

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
- [SESSION_HISTORY.md](./SESSION_HISTORY.md): Detailed log of research, findings, and decisions.
- [TEST_PLAN.md](./TEST_PLAN.md): Current test coverage and verification status.
