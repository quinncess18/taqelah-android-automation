// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');

test.describe('Login Negative Tests', () => {
  let loginPage;

  test.beforeAll(async ({ driver }) => {
    loginPage = new LoginPage(driver);
  });

  test('TC-N01: should show validation errors when fields are left empty', async ({ driver }) => {
    await loginPage.waitForPageLoad();

    await loginPage.login(null, null);

    const userErr = await loginPage.getErrorMessage('username');
    const passErr = await loginPage.getErrorMessage('password');

    expect(userErr).toBe(loginPage.errUsernameRequired);
    expect(passErr).toBe(loginPage.errPasswordRequired);

    expect(await loginPage.isVisible(loginPage.title)).toBe(true);
  });

  test('TC-N02: should show error for invalid username format', async ({ driver }) => {
    await loginPage.waitForPageLoad();

    await loginPage.fillCredentials('invalid-user', loginPage.defaultPass);

    await loginPage.togglePasswordVisibility();
    await loginPage.verifyUsername('invalid-user');
    await loginPage.verifyPasswordPlaintext(loginPage.defaultPass);

    await loginPage.submitLogin();

    const error = await loginPage.getErrorMessage('main');
    expect(error).toContain(loginPage.errInvalidCreds);
    expect(error).toContain(`Hint: ${loginPage.defaultUser} / ${loginPage.defaultPass}`);
  });

  test('TC-N03: should show error for valid username with invalid password', async ({ driver }) => {
    await loginPage.waitForPageLoad();

    await loginPage.fillCredentials(loginPage.defaultUser, 'wrong-pass');

    await loginPage.verifyUsername(loginPage.defaultUser);
    await loginPage.verifyPasswordPlaintext('wrong-pass');

    await loginPage.submitLogin();

    const error = await loginPage.getErrorMessage('main');
    expect(error).toContain(loginPage.errInvalidCreds);
  });
});
