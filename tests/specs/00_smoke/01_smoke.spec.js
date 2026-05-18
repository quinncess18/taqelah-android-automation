// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');

// ─────────────────────────────────────────────────────────────────────────────
// §0 Smoke — foundation check. Runs FIRST in the suite. If this fails the
// app is fundamentally broken and there's no point running the 30+ minute
// unit suite below. Deliberately narrow: login + first-render + logout.
// No cart, no checkout — those belong to regression (§16).
//
// Ends on the Login screen so 01_auth's TC-L01 inherits a clean state.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Smoke (§0) — foundation', () => {
  /** @type {LoginPage} */ let loginPage;
  /** @type {CatalogLandingPage} */ let landingPage;

  test.beforeAll(async ({ driver }) => {
    try { await driver.updateSettings({ waitForIdleTimeout: 0 }); } catch {}
    loginPage = new LoginPage(driver);
    landingPage = new CatalogLandingPage(driver);
  });

  test('TC-SM01: app launches → login works → Catalog Landing renders → logout returns to Login', async () => {
    // 1. App launches → Login screen is the entry point.
    await loginPage.waitForPageLoad();
    expect(await loginPage.isVisible(loginPage.usernameField)).toBe(true);
    expect(await loginPage.isVisible(loginPage.passwordField)).toBe(true);
    expect(await loginPage.isVisible(loginPage.loginButton)).toBe(true);

    // 2. Login with default credentials → Catalog Landing renders.
    await loginPage.login(loginPage.defaultUser, loginPage.defaultPass);
    await landingPage.waitForPageLoad();
    expect(await landingPage.isVisible(landingPage.shopAllBtn)).toBe(true);

    // 3. Logout via drawer → app returns to Login. This also leaves a clean
    //    state for 01_auth's TC-L01 which expects to start on Login.
    await loginPage.logout();
    expect(await loginPage.isVisible(loginPage.usernameField)).toBe(true);
    expect(await loginPage.isVisible(loginPage.loginButton)).toBe(true);
  });
});
