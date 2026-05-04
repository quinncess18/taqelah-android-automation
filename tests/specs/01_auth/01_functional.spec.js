// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');

test.describe('Login Functional Tests', () => {
  let loginPage;
  let landingPage;

  test.beforeAll(async ({ driver }) => {
    loginPage = new LoginPage(driver);
    landingPage = new CatalogLandingPage(driver);
  });

  test('TC-L01: should verify that the login page elements are visible', async ({ driver }) => {
    await loginPage.waitForPageLoad();

    expect(await loginPage.isVisible(loginPage.title)).toBe(true);
    expect(await loginPage.isVisible(loginPage.usernameField)).toBe(true);
    expect(await loginPage.isVisible(loginPage.passwordField)).toBe(true);
    expect(await loginPage.isVisible(loginPage.loginButton)).toBe(true);
  });

  test('TC-L02: should toggle password visibility and maintain layout stability', async ({ driver }) => {
    await loginPage.waitForPageLoad();

    await loginPage.fillCredentials(loginPage.defaultUser, '12345678');
    await loginPage.verifyPasswordMasked(8);
    await loginPage.togglePasswordVisibility();
    await loginPage.verifyPasswordPlaintext('12345678');

    await loginPage.revealDemoCredentials();
    expect(await loginPage.isVisible(loginPage.demoCredentials)).toBe(true);

    await loginPage.togglePasswordVisibility();
    await loginPage.verifyPasswordMasked(8);
  });

  test('TC-L03: should preserve credential state when the app is backgrounded', async ({ driver }) => {
    await loginPage.waitForPageLoad();
    await loginPage.verifyUsername(loginPage.defaultUser);

    await loginPage.deviceHome();
    await driver.pause(3000);
    await loginPage.deviceForeground(false);
    await loginPage.waitForPageLoad();

    await loginPage.verifyUsername(loginPage.defaultUser);
  });

  test('TC-L04: should clear unsaved credential state when the app is exited', async ({ driver }) => {
    if (!driver.isAndroid) return;

    await loginPage.waitForPageLoad();
    await loginPage.fillPasswordOnly(loginPage.defaultPass);

    await loginPage.deviceBack();
    await driver.pause(3000);
    await loginPage.deviceForeground(true);
    await loginPage.waitForPageLoad();

    await loginPage.verifyUsername('');
    await loginPage.verifyPasswordPlaintext('');
  });

  test('TC-L05: should successfully login with valid demo credentials', async ({ driver }) => {
    await loginPage.waitForPageLoad();
    await loginPage.login(loginPage.defaultUser, loginPage.defaultPass);

    await landingPage.waitForPageLoad();
    expect(await landingPage.isVisible(landingPage.shopAllBtn)).toBe(true);
  });

  test('TC-L06: should persist session after process kill and successfully logout', async ({ driver }) => {
    await landingPage.waitForPageLoad();

    await loginPage.killAndRelaunchApp();
    await loginPage.logout();

    await loginPage.waitForPageLoad();
    expect(await loginPage.isVisible(loginPage.title)).toBe(true);
  });
});
