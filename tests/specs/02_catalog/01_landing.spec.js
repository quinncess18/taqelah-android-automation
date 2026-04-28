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
  let gridPage;
  let cartPage;
  let gestures;

  test.beforeAll(async ({ driver }) => {
    loginPage = new LoginPage(driver);
    landingPage = new CatalogLandingPage(driver);
    gridPage = new ProductGridPage(driver);
    cartPage = new CartPage(driver);
    gestures = new Gestures(driver);

    // SELF-HEALING: Only login if the app is on the login screen
    const isLoggedOut = await driver.$(loginPage.title).isDisplayed();
    if (isLoggedOut) {
      await loginPage.waitForPageLoad();
      await loginPage.login(null, loginPage.defaultPass);
      await landingPage.waitForPageLoad();
    }
  });

  test('TC-C01: should verify Homepage comprehensive UI and adaptive scroll', async ({ driver }) => {
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
    
    // SINGLE MASTER SCROLL
    await gestures.scrollDown(0.8);
    await driver.pause(1000);

    const boho = await driver.$(landingPage.categoryBoho);
    expect(await boho.isDisplayed()).toBe(true);

    // 5. UNIVERSAL SAFE-ZONE RESET
    await gestures.scrollToTop();
    await expect(await (await driver.$(landingPage.heroBanner)).isDisplayed()).toBe(true);
  });

  test('TC-C02: should verify the Cart empty state from Homepage', async ({ driver }) => {
    await (await driver.$(landingPage.cartBtn)).click();
    await cartPage.waitForPageLoad();

    expect(await (await driver.$(cartPage.cartTitle)).isDisplayed()).toBe(true);
    expect(await (await driver.$(cartPage.emptyCartMsg)).isDisplayed()).toBe(true);
    
    await cartPage.clickContinueShopping();
    await landingPage.waitForPageLoad();
  });

  test('TC-C03: should verify the "All Dresses" page default state (via Shop All)', async ({ driver }) => {
    test.setTimeout(60000);

    // 1. Wait for Homepage stability after TC-C02 return
    await landingPage.waitForPageLoad();
    await landingPage.navigateToShopAll();
    await gridPage.waitForPageLoad();

    // 2. Immediate Top Verification (Stay at the top)
    expect(await (await driver.$(landingPage.navMenuBtn)).isDisplayed()).toBe(true);
    expect(await (await driver.$(gridPage.sortBtn)).isDisplayed()).toBe(true);
    
    const firstProduct = await gridPage.getFirstProductDetails();
    expect(firstProduct).toContain(products.anchors.alphaFirst.name);

    // Verify initial metadata (Data-Driven)
    const resultCount = await driver.$(gridPage.resultCount);
    expect(await resultCount.getAttribute('content-desc')).toContain(`${products.catalog.totalItems} items`);
  });

  test('TC-C04: should verify dynamic metadata updates and card integrity during full-page scroll', async ({ driver }) => {
    test.setTimeout(180000);
    
    // PERFORM THE AUDIT (Starts from the top where TC-C03 ended)
    const catalogIntact = await gridPage.verifyFullCatalogIntegrity();
    expect(catalogIntact).toBe(true);
  });

  test('TC-C05: should verify all sorting modes using Universal Product Truths', async ({ driver }) => {
    // Structural Check (Self-Healing Navigation)
    if (!(await driver.$(gridPage.gridTitle(products.anchors.alphaFirst.name))).isExisting()) {
      await landingPage.navigateToShopAll();
      await gridPage.waitForPageLoad();
    }
    
    // --- Mode 1: Price (Low to High) ---
    await gridPage.openSortMenu();
    await gridPage.selectSort('LowHigh');
    await driver.pause(1000); 
    await gridPage.resetToTop();
    await gridPage.nudgeToRevealFirstItem();
    
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

  test('TC-C06: should verify the Cart empty state from All Dresses grid', async ({ driver }) => {
    // Structural Check (Data-Driven anchor)
    if (!(await driver.$(gridPage.gridTitle(products.anchors.alphaFirst.name))).isExisting()) {
      await landingPage.navigateToShopAll();
      await gridPage.waitForPageLoad();
    }

    await (await driver.$(gridPage.cartBtn)).click();
    await cartPage.waitForPageLoad();

    expect(await (await driver.$(cartPage.cartTitle)).isDisplayed()).toBe(true);
    expect(await (await driver.$(cartPage.emptyCartMsg)).isDisplayed()).toBe(true);
    
    await cartPage.clickContinueShopping();
    await gridPage.waitForPageLoad();
  });

  test('TC-C07: should verify the "View All" hyperlink navigation and full audit', async ({ driver }) => {
    test.setTimeout(150000);

    await driver.back();
    await landingPage.waitForPageLoad();

    await (await driver.$(landingPage.viewAllCategoriesBtn)).click();
    await gridPage.waitForPageLoad();

    // 1. Immediate Top Verification
    const firstProduct = await gridPage.getFirstProductDetails();
    expect(firstProduct).toContain(products.anchors.alphaFirst.name);

    // 2. Perform Full Data Integrity Audit
    const catalogIntact = await gridPage.verifyFullCatalogIntegrity();
    expect(catalogIntact).toBe(true);
  });
});
