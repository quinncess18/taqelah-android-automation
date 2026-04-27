// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
const { ProductGridPage } = require('../../pages/ProductGridPage');
const { CartPage } = require('../../pages/CartPage');
const products = require('../../data/products');

test.describe('Catalog Module - Category Data & Functional Integrity', () => {
  let landingPage;
  let gridPage;

  test.beforeAll(async ({ driver }) => {
    landingPage = new CatalogLandingPage(driver);
    gridPage = new ProductGridPage(driver);
  });

  /**
   * Helper to perform functional audit for a category (Sorts -> Scroll -> Cart)
   * Optimized "One-Way Down" journey.
   * @param {any} driver
   * @param {Object} data - Category data from products.js
   */
  async function performCategoryFunctionalAudit(driver, data) {
    const cartPage = new CartPage(driver);

    // 1. Navigation
    await landingPage.selectCategory(data.name);
    await gridPage.waitForPageLoad();

    // 2. Sorting Quad-Audit (One-Way Down Strategy)
    
    // --- Mode 1: Price (Low to High) ---
    await gridPage.openSortMenu();
    await gridPage.selectSort('LowHigh');
    await driver.pause(1000); 
    // TABLET ONLY: Perform the first and only nudge to reveal metadata
    await gridPage.nudgeToRevealFirstItem();
    
    const lowPrice = await gridPage.getFirstProductDetails();
    expect(lowPrice).toContain(data.anchors.cheapest); 

    // --- Mode 2: Price (High to Low) ---
    await gridPage.openSortMenu();
    await gridPage.selectSort('HighLow');
    await driver.pause(1000);
    const highPrice = await gridPage.getFirstProductDetails();
    expect(highPrice).toContain(data.anchors.mostExpensive); 

    // --- Mode 3: Name (Z-A) ---
    await gridPage.openSortMenu();
    await gridPage.selectSort('ZA');
    await driver.pause(1000);
    const lastAlpha = await gridPage.getFirstProductDetails();
    expect(lastAlpha).toContain(data.anchors.alphaLast);

    // --- Mode 4: Name (A-Z) ---
    await gridPage.openSortMenu();
    await gridPage.selectSort('AZ');
    await driver.pause(1000);
    const firstAlpha = await gridPage.getFirstProductDetails();
    expect(firstAlpha).toContain(data.anchors.alphaFirst);

    // 3. Data Integrity Audit (Scroll 8 items + Settle)
    const integrityPass = await gridPage.verifyCategoryIntegrity(data);
    expect(integrityPass).toBe(true);

    // 4. Context Retention Check
    await (await driver.$(gridPage.cartBtn)).click();
    await cartPage.waitForPageLoad();
    expect(await (await driver.$(cartPage.cartTitle)).isDisplayed()).toBe(true);
    expect(await (await driver.$(cartPage.emptyCartMsg)).isDisplayed()).toBe(true);
    
    await cartPage.clickContinueShopping();
    await gridPage.waitForPageLoad();
    expect(await (await driver.$(gridPage.gridTitle(data.name))).isDisplayed()).toBe(true);

    // 5. Return Home
    await driver.back();
    await driver.pause(1000);
  }

  test('TC-C08: should verify Casual Dresses data and functional integrity', async ({ driver }) => {
    // Handling transition from previous session (Grid -> Home)
    await driver.back();
    await driver.pause(1000);
    await performCategoryFunctionalAudit(driver, products.categories.casual);
  });

  test('TC-C09: should verify Evening Dresses data and functional integrity', async ({ driver }) => {
    await performCategoryFunctionalAudit(driver, products.categories.evening);
  });

  test('TC-C10: should verify Party Dresses data and functional integrity', async ({ driver }) => {
    await performCategoryFunctionalAudit(driver, products.categories.party);
  });

  test('TC-C11: should verify Boho Dresses data and functional integrity', async ({ driver }) => {
    await performCategoryFunctionalAudit(driver, products.categories.boho);
  });
});
