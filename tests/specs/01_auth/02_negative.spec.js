// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');

test.describe('Login Negative Tests', () => {
  
  test('TC-N01: should show validation errors when fields are left empty', async ({ driver }) => {
    const loginPage = new LoginPage(driver);
    await loginPage.waitForPageLoad();

    // Click login with empty fields
    await loginPage.login(null, null);

    const userErr = await loginPage.getErrorMessage('username');
    const passErr = await loginPage.getErrorMessage('password');

    expect(userErr).toBe('Please enter your username');
    expect(passErr).toBe('Please enter your password');
    
    expect(await (await driver.$(loginPage.title)).isDisplayed()).toBe(true);
  });

  test('TC-N02: should show error for invalid username (format) with valid password', async ({ driver }) => {
    const loginPage = new LoginPage(driver);
    await loginPage.waitForPageLoad();
    
    const userEl = await driver.$(loginPage.usernameField);
    await userEl.click();
    await userEl.addValue('invalid-user');
    
    await loginPage.togglePasswordVisibility();
    await driver.pause(500);

    const passEl = await driver.$(loginPage.passwordField);
    await passEl.click();
    await passEl.addValue('10203040');
    
    await (await driver.$(loginPage.loginButton)).click();
    
    const error = await loginPage.getErrorMessage('main');
    expect(error).toContain("Invalid username or password");
    expect(error).toContain("Hint: emma@demoapp.com / 10203040");
  });

  test('TC-N03: should show error for valid username with invalid password', async ({ driver }) => {
    const loginPage = new LoginPage(driver);
    await loginPage.waitForPageLoad();
    
    await loginPage.clearField(loginPage.usernameField);
    await loginPage.clearField(loginPage.passwordField);

    const userEl = await driver.$(loginPage.usernameField);
    await userEl.click();
    await userEl.addValue('emma@demoapp.com');
    
    // Eye is already ON from TC-N02
    await driver.pause(500);

    const passEl = await driver.$(loginPage.passwordField);
    await passEl.click();
    await passEl.addValue('wrong-pass');
    
    await (await driver.$(loginPage.loginButton)).click();

    const error = await loginPage.getErrorMessage('main');
    expect(error).toContain("Invalid username or password");
  });
});
