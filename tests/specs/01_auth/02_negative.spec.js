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

    // login() helper handles the submission and keyboard dismissal automatically
    await loginPage.login(null, null);

    const userErr = await loginPage.getErrorMessage('username');
    const passErr = await loginPage.getErrorMessage('password');

    expect(userErr).toBe('Please enter your username');
    expect(passErr).toBe('Please enter your password');
    
    expect(await (await driver.$(loginPage.title)).isDisplayed()).toBe(true);
  });

  test('TC-N02: should show error for invalid username format', async ({ driver }) => {
    await loginPage.waitForPageLoad();
    
    await loginPage.fillCredentials('invalid-user', loginPage.defaultPass);
    
    // VERIFICATION WITH TOGGLE: Prove the default password is correct plaintext
    await loginPage.togglePasswordVisibility();
    await loginPage.verifyUsername('invalid-user');
    await loginPage.verifyPasswordPlaintext(loginPage.defaultPass);
    
    // Submit
    await (await driver.$(loginPage.loginButton)).click();
    
    const error = await loginPage.getErrorMessage('main');
    expect(error).toContain("Invalid username or password");
    expect(error).toContain(`Hint: ${loginPage.defaultUser} / ${loginPage.defaultPass}`);
  });

  test('TC-N03: should show error for valid username with invalid password', async ({ driver }) => {
    await loginPage.waitForPageLoad();
    
    await loginPage.fillCredentials(loginPage.defaultUser, 'wrong-pass');

    // TRANSPARENCY VERIFICATION: Confirm the incorrect plaintext is held in memory
    await loginPage.verifyUsername(loginPage.defaultUser);
    await loginPage.verifyPasswordPlaintext('wrong-pass'); 
    
    // Submit
    await (await driver.$(loginPage.loginButton)).click();

    const error = await loginPage.getErrorMessage('main');
    expect(error).toContain("Invalid username or password");
  });
});
