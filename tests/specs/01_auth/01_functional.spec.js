// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');

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
    await loginPage.waitForPageLoad();
    
    // REQUIREMENT: Wrong password input + eye toggle function
    await loginPage.fillCredentials(loginPage.defaultUser, '12345678');
    
    await loginPage.verifyPasswordMasked(8);
    await loginPage.togglePasswordVisibility();
    await driver.pause(500);
    await loginPage.verifyPasswordPlaintext('12345678');

    // Page Object intelligently handles scroll only if needed
    await loginPage.revealDemoCredentials();
    
    const demoCreds = await driver.$(loginPage.demoCredentials);
    expect(await demoCreds.isDisplayed()).toBe(true);
    
    await loginPage.togglePasswordVisibility();
    await loginPage.verifyPasswordMasked(8);
  });

  test('TC-L03: should preserve credential state when the app is backgrounded (Home Button)', async ({ driver }) => {
    const loginPage = new LoginPage(driver);
    await loginPage.waitForPageLoad();

    // REQUIREMENT: Correct username + retain masked incorrect password from L02
    await loginPage.verifyUsername(loginPage.defaultUser);
    await loginPage.verifyPasswordMasked(8);
    
    // Background the app (Home)
    if (driver.isAndroid) {
      await driver.execute('mobile: shell', { command: 'input', args: ['keyevent', '3'] });
    } else {
      await driver.backgroundApp(-1); 
    }
    await driver.pause(3000);

    // Foreground the app
    if (driver.isAndroid) {
      await driver.execute('mobile: startActivity', { intent: 'com.taqelah.demo_app/com.taqelah.demo_app.MainActivity' });
    } else {
      await driver.activateApp('com.taqelah.demoApp');
    }

    await loginPage.waitForPageLoad();
    
    // VERIFY PRESERVATION
    await loginPage.verifyUsername(loginPage.defaultUser);
    await loginPage.verifyPasswordMasked(8);
  });

  test('TC-L04: should clear unsaved credential state when the app is exited (Back Button)', async ({ driver }) => {
    const loginPage = new LoginPage(driver);
    if (!driver.isAndroid) return; 

    await loginPage.waitForPageLoad();
    
    // REQUIREMENT: No change username + replace with correct password (still masked)
    await loginPage.fillPasswordOnly(loginPage.defaultPass);
    await loginPage.verifyUsername(loginPage.defaultUser);
    await loginPage.verifyPasswordMasked(8);
    
    // Exit the app (Back)
    await driver.execute('mobile: shell', { command: 'input', args: ['keyevent', '4'] });
    await driver.pause(3000);

    // Restart the app
    await driver.execute('mobile: startActivity', { intent: 'com.taqelah.demo_app/com.taqelah.demo_app.MainActivity' });

    await loginPage.waitForPageLoad();
    
    // VERIFY RESET: Both fields must be empty after destructive exit
    await loginPage.verifyUsername('');
    await loginPage.verifyPasswordPlaintext(''); 
  });

  test('TC-L05: should successfully login with valid demo credentials', async ({ driver }) => {
    const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
    const loginPage = new LoginPage(driver);
    const landingPage = new CatalogLandingPage(driver);
    
    await loginPage.waitForPageLoad();
    
    // Fill credentials but don't submit yet
    await loginPage.fillCredentials(loginPage.defaultUser, loginPage.defaultPass);
    
    // Unmask to verify the data is 100% correct
    await loginPage.togglePasswordVisibility();
    await loginPage.verifyPasswordPlaintext(loginPage.defaultPass);
    
    // Submit
    await (await driver.$(loginPage.loginButton)).click();

    await landingPage.waitForPageLoad();
    expect(await (await driver.$(landingPage.shopAllBtn)).isDisplayed()).toBe(true);
  });

  test('TC-L06: should persist session after process kill and successfully logout', async ({ driver }) => {
    const loginPage = new LoginPage(driver);
    await loginPage.waitForPageLoad();

    // 1. Verify Persistence
    const pkg = driver.isAndroid ? 'com.taqelah.demo_app' : 'com.taqelah.demoApp';
    await driver.terminateApp(pkg);
    await driver.pause(2000);
    await driver.activateApp(pkg);

    // 2. Perform Adaptive Logout
    await loginPage.logout();

    // 3. Verify return to Login screen
    await loginPage.waitForPageLoad();
    expect(await (await driver.$(loginPage.title)).isDisplayed()).toBe(true);
  });
});
