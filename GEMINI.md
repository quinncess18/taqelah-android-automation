# GEMINI.md

This file defines the foundational mandates and operational protocols for the **Taqelah Android Automation** project. These instructions take absolute precedence over general defaults.

## Core Mandates

### 1. Permission Gate (STRICT)
- **No code modification is allowed without explicit user approval.**
- Every proposal must include:
    - Target file(s) and specific method/function scope.
    - Rationale based on empirical diagnosis or research.
    - Confirmation that out-of-scope changes are excluded.

### 2. Session Anchoring
- **Every new session MUST begin by reading SESSION_HISTORY.md.**
- This ensures continuity and prevents repetitive research or logic regression.

### 3. Android-First Validation
- Initial framework development is focused exclusively on **Android** (Pixel 5 and Pixel Tablet).
- iOS porting will occur after the Android framework is stable.

### 4. Flutter Automation Strategy
- The app is built with **Flutter 3.x**.
- **Primary Selector Strategy:** Use Flutter Finder targeting the centralized TestKeys identified in the app source.
- Avoid raw XPath unless interacting with non-Flutter components (like WebViews or OS dialogs).

## Technical Conventions

### Appium & Driver
- **Base Path:** Always use / (Appium 2.x).
- **Reset Strategy:** Use mobile: startActivity for non-destructive resets (preserves instrumentation).

### Documentation Alignment
- Every major fix or architectural change must be reflected in:
    - SESSION_HISTORY.md (Timeline)
    - TEST_PLAN.md (Coverage)
    - README.md (Infrastructure)

## Common Commands
```bash
# Run all tests (Dual-device)
npm test

# Targeted runs
npm run test:login
npm run test:catalog

# Infrastructure
npm run appium:start
adb devices
```
