// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
const { NavMenuPage } = require('../../pages/NavMenuPage');
const { CartPage } = require('../../pages/CartPage');
const { AboutPage } = require('../../pages/AboutPage');

test.describe('Navigation - Main Store Routing (01)', () => {
  let loginPage;
  let landingPage;
  let navMenu;
  let cartPage;
  let aboutPage;

  test.beforeAll(async ({ driver }) => {
    loginPage = new LoginPage(driver);
    landingPage = new CatalogLandingPage(driver);
    navMenu = new NavMenuPage(driver);
    cartPage = new CartPage(driver);
    aboutPage = new AboutPage(driver);

    // SELF-HEALING: Ensure we are logged in and on the Homepage
    const onLoginScreen = await driver.$(loginPage.usernameField).isDisplayed();
    if (onLoginScreen) {
        await loginPage.login(null, loginPage.defaultPass);
        await landingPage.waitForPageLoad();
    }
  });

  test('TC-M01: should verify Routing and Functionality for Home, Cart, and About', async ({ driver }) => {
    // 1. Home Link
    await navMenu.open();
    await navMenu.navigateTo(navMenu.navHome);
    expect(await (await driver.$(navMenu.demoAppTitle)).isDisplayed()).toBe(true);

    // 2. Cart Link
    await navMenu.open();
    await navMenu.navigateTo(navMenu.navCart);
    await cartPage.waitForPageLoad();
    expect(await (await driver.$(cartPage.cartTitle)).isDisplayed()).toBe(true);
    
    await (await driver.$(cartPage.backBtn)).click();
    await landingPage.waitForPageLoad();

    // 3. About Link (Deep Functional Audit)
    await navMenu.open();
    await navMenu.navigateTo(navMenu.navAbout);
    await aboutPage.waitForPageLoad();
    
    // Header & Bottom Verification
    expect(await (await driver.$(aboutPage.title)).isDisplayed()).toBe(true);
    await aboutPage.scrollToBottom();
    expect(await (await driver.$(aboutPage.footerUrl)).isDisplayed()).toBe(true);

    // Visual Theme Toggle
    const lightModeBase64 = await driver.takeScreenshot();
    await (await driver.$(aboutPage.darkModeSwitch)).click();
    await driver.pause(1500); 
    const darkModeBase64 = await driver.takeScreenshot();
    expect(darkModeBase64).not.toBe(lightModeBase64); 
    
    // Revert and Return Home
    await (await driver.$(aboutPage.darkModeSwitch)).click();
    await (await driver.$(aboutPage.backBtn)).click();
    await landingPage.waitForPageLoad();
  });
});
