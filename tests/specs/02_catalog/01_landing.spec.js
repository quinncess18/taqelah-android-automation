// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
const { ProductGridPage } = require('../../pages/ProductGridPage');
const { CartPage } = require('../../pages/CartPage');
const { Gestures } = require('../../utils/Gestures');
const products = require('../../data/products');

test.describe('Catalog Module - Landing UI Master Check', () => {
  let loginPage;
  let landingPage;
  let gestures;

  test.beforeAll(async ({ driver }) => {
    loginPage = new LoginPage(driver);
    landingPage = new CatalogLandingPage(driver);
    gestures = new Gestures(driver);
  });

  test('TC-C01: should verify Homepage comprehensive UI and adaptive scroll', async ({ driver }) => {
    await loginPage.waitForPageLoad();
    await loginPage.clearField(loginPage.passwordField);
    await loginPage.login(null, loginPage.defaultPass);

    await landingPage.waitForPageLoad();

    // 1. Header Verification
    expect(await (await driver.$(landingPage.navMenuBtn)).isDisplayed()).toBe(true);
    expect(await (await driver.$(landingPage.title)).isDisplayed()).toBe(true);
    expect(await (await driver.$(landingPage.cartBtn)).isDisplayed()).toBe(true);

    // 2. Hero Section Verification
    expect(await (await driver.$(landingPage.heroBanner)).isDisplayed()).toBe(true);
    expect(await (await driver.$(landingPage.shopAllBtn)).isEnabled()).toBe(true);

    // 3. Category List - Data Driven Verification
    const casual = await driver.$(landingPage.categoryCasual);
    expect(await casual.isDisplayed()).toBe(true);
    
    // SINGLE MASTER SCROLL: Reach the bottom in one fluid motion
    await gestures.scrollDown(0.8);
    await driver.pause(1000);

    // Verify Bottom Category (Data from products.js)
    const boho = await driver.$(landingPage.categoryBoho);
    expect(await boho.isDisplayed()).toBe(true);

    // 5. UNIVERSAL SAFE-ZONE RESET
    await gestures.scrollToTop();
    await expect(await (await driver.$(landingPage.heroBanner)).isDisplayed()).toBe(true);
  });

  test('TC-C02: should verify the Cart empty state from Homepage', async ({ driver }) => {
    const cartPage = new CartPage(driver);
    await (await driver.$(landingPage.cartBtn)).click();
    await cartPage.waitForPageLoad();

    expect(await (await driver.$(cartPage.cartTitle)).isDisplayed()).toBe(true);
    expect(await (await driver.$(cartPage.emptyCartMsg)).isDisplayed()).toBe(true);
    
    await cartPage.clickContinueShopping();
    await landingPage.waitForPageLoad();
  });

  test('TC-C03: should verify the "All Dresses" page default state (via Shop All)', async ({ driver }) => {
    const gridPage = new ProductGridPage(driver);
    await landingPage.navigateToShopAll();
    await gridPage.waitForPageLoad();

    expect(await (await driver.$(landingPage.navMenuBtn)).isDisplayed()).toBe(true);
    expect(await (await driver.$(gridPage.sortBtn)).isDisplayed()).toBe(true);

    // Metadata Verification (Dynamic total from products.js)
    const resultCount = await driver.$(gridPage.resultCount);
    expect(await resultCount.getAttribute('content-desc')).toContain(`${products.catalog.totalItems} items`);
  });

  test('TC-C04: should verify card integrity during full-page scroll', async ({ driver }) => {
    test.setTimeout(120000);
    const gridPage = new ProductGridPage(driver);
    
    // Integrity check for full catalog (Total count from products.js)
    const catalogIntact = await gridPage.verifyFullCatalogIntegrity();
    expect(catalogIntact).toBe(true);
  });

  test('TC-C05: should verify all sorting modes using Universal Product Truths', async ({ driver }) => {
    const gridPage = new ProductGridPage(driver);
    
    if (!(await driver.$(gridPage.gridTitle)).isDisplayed()) {
      await landingPage.navigateToShopAll();
      await gridPage.waitForPageLoad();
    }
    
    // --- Mode 1: Price (Low to High) ---
    await gridPage.openSortMenu();
    await gridPage.selectSort('LowHigh');
    await driver.pause(1000); 
    await gridPage.resetToTop();
    const lowPriceDetails = await gridPage.getFirstProductDetails();
    expect(lowPriceDetails).toContain(products.anchors.cheapest.price); 

    // --- Mode 2: Price (High to Low) ---
    await gridPage.openSortMenu();
    await gridPage.selectSort('HighLow');
    await driver.pause(1000);
    const highPriceDetails = await gridPage.getFirstProductDetails();
    expect(highPriceDetails).toContain(products.anchors.mostExpensive.price); 

    // --- Mode 3: Name (Z-A) ---
    await gridPage.openSortMenu();
    await gridPage.selectSort('ZA');
    await driver.pause(1000);
    const lastAlphaDetails = await gridPage.getFirstProductDetails();
    expect(lastAlphaDetails).toContain(products.anchors.alphaLast.name);

    // --- Mode 4: Name (A-Z) ---
    await gridPage.openSortMenu();
    await gridPage.selectSort('AZ');
    await driver.pause(1000);
    const firstAlphaDetails = await gridPage.getFirstProductDetails();
    expect(firstAlphaDetails).toContain(products.anchors.alphaFirst.name);
  });
});
