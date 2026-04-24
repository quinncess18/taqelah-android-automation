// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { Gestures } = require('../../utils/Gestures');

test.describe('Login Functional Tests', () => {
  
  test('TC-L01: should verify that the login page elements are visible', async ({ driver }) => {
    const loginPage = new LoginPage(driver);
    await loginPage.waitForPageLoad();
    
    expect(await (await driver.$(loginPage.title)).isDisplayed()).toBe(true);
    expect(await (await driver.$(loginPage.usernameField)).isDisplayed()).toBe(true);
    expect(await (await driver.$(loginPage.passwordField)).isDisplayed()).toBe(true);
    expect(await (await driver.$(loginPage.loginButton)).isDisplayed()).toBe(true);
  });

  test('TC-L02: should toggle password visibility and maintain layout stability', async ({ driver }) => {
    const loginPage = new LoginPage(driver);
    const gestures = new Gestures(driver);
    await loginPage.waitForPageLoad();
    
    await loginPage.clearField(loginPage.passwordField);

    const passField = await driver.$(loginPage.passwordField);
    await passField.click();
    await passField.addValue('12345678');
    
    const loginBtn = await driver.$(loginPage.loginButton);
    expect(await loginBtn.isDisplayed()).toBe(true);
    expect(await loginBtn.isEnabled()).toBe(true);

    expect(await loginPage.isPasswordMasked()).toBe(true);
    await loginPage.togglePasswordVisibility();
    await driver.pause(500);
    expect(await loginPage.isPasswordMasked()).toBe(false);

    const { width, height } = await driver.getWindowRect();
    const centerX = Math.round(width / 2);
    const startY = Math.round(height * 0.4); 
    const endY = Math.round(height * 0.1);
    await gestures.swipe(centerX, startY, centerX, endY);
    
    const demoCreds = await driver.$('android=new UiSelector().description("Demo Credentials")');
    expect(await demoCreds.isDisplayed()).toBe(true);
    
    await loginPage.togglePasswordVisibility();
    await driver.pause(500);
    expect(await loginPage.isPasswordMasked()).toBe(true);
    await driver.hideKeyboard();
  });

  test('TC-L03: should preserve credential state when the app is backgrounded (Home Button)', async ({ driver }) => {
    const loginPage = new LoginPage(driver);
    await loginPage.waitForPageLoad();

    const testUser = 'emma@demoapp.com';
    const expectedMasked = '••••••••'; 
    
    const userEl = await driver.$(loginPage.usernameField);
    await userEl.click();
    await userEl.clearValue();
    await userEl.addValue(testUser);
    
    await driver.execute('mobile: shell', { command: 'input', args: ['keyevent', '3'] });
    await driver.pause(3000);

    await driver.execute('mobile: startActivity', {
      intent: 'com.taqelah.demo_app/com.taqelah.demo_app.MainActivity'
    });

    await loginPage.waitForPageLoad();
    expect(await userEl.getText()).toBe(testUser);
    
    const passEl = await driver.$(loginPage.passwordField);
    expect(await passEl.getText()).toBe(expectedMasked);
  });

  test('TC-L04: should lose unsaved credential state when the app is exited (Back Button)', async ({ driver }) => {
    const loginPage = new LoginPage(driver);
    await loginPage.waitForPageLoad();
    
    const userEl = await driver.$(loginPage.usernameField);
    await driver.execute('mobile: shell', { command: 'input', args: ['keyevent', '4'] });
    await driver.pause(3000);

    await driver.execute('mobile: startActivity', {
      intent: 'com.taqelah.demo_app/com.taqelah.demo_app.MainActivity'
    });

    await loginPage.waitForPageLoad();
    const currentUser = await userEl.getText();
    expect(currentUser).toBe(''); 
  });

  test('TC-L05: should successfully login with valid demo credentials', async ({ driver }) => {
    const loginPage = new LoginPage(driver);
    await loginPage.waitForPageLoad();
    
    const userEl = await driver.$(loginPage.usernameField);
    await userEl.click();
    await userEl.addValue('emma@demoapp.com');
    await loginPage.togglePasswordVisibility();
    await driver.pause(500);

    const passEl = await driver.$(loginPage.passwordField);
    await passEl.click();
    await passEl.addValue('10203040');

    await (await driver.$(loginPage.loginButton)).click();

    const shopAllBtn = await driver.$('android=new UiSelector().className("android.widget.Button").description("Shop All")');
    await shopAllBtn.waitForDisplayed({ timeout: 15000 });
    expect(await shopAllBtn.isDisplayed()).toBe(true);
  });

  test('TC-L06: should persist session after process kill and successfully logout', async ({ driver }) => {
    const loginPage = new LoginPage(driver);
    await loginPage.waitForPageLoad();

    // 1. Verify Persistence (Hard Reset)
    const shopAllBtn = await driver.$('android=new UiSelector().className("android.widget.Button").description("Shop All")');
    await shopAllBtn.waitForDisplayed({ timeout: 5000 });

    const pkg = 'com.taqelah.demo_app';
    await driver.terminateApp(pkg);
    await driver.pause(2000);
    await driver.activateApp(pkg);

    await shopAllBtn.waitForDisplayed({ timeout: 15000 });
    expect(await shopAllBtn.isDisplayed()).toBe(true);

    // 2. Perform Manual Logout Sequence
    // Open Navigation Menu
    await (await driver.$(loginPage.navMenuBtn)).click();
    await driver.pause(1000);

    // Swipe up on the left side of the drawer to reveal Logout
    // Bounds for drawer are roughly [0,0][798,2400]
    await loginPage.swipe(300, 2000, 300, 500); 
    await driver.pause(500);

    // Click Logout
    const logoutBtn = await driver.$(loginPage.logoutBtn);
    await logoutBtn.click();

    // 3. Verify return to Login screen with empty fields
    await loginPage.waitForPageLoad();
    expect(await (await driver.$(loginPage.title)).isDisplayed()).toBe(true);
    
    const userValue = await (await driver.$(loginPage.usernameField)).getText();
    const passValue = await (await driver.$(loginPage.passwordField)).getText();
    
    expect(userValue).toBe('');
    expect(passValue).toBe('');
  });
});
