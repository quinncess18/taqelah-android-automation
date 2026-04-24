// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
const { ProductGridPage } = require('../../pages/ProductGridPage');
const { CartPage } = require('../../pages/CartPage');
const { Gestures } = require('../../utils/Gestures');

test.describe('Catalog Module - Landing, Cart & Shop All', () => {
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
  });

  test('TC-C01: should complete login correction and verify Homepage default state', async ({ driver }) => {
    await loginPage.waitForPageLoad();
    await loginPage.clearField(loginPage.passwordField);
    await loginPage.login(null, '10203040');

    await landingPage.waitForPageLoad();

    // 1. Header Verification
    expect(await (await driver.$(landingPage.navMenuBtn)).isDisplayed()).toBe(true);
    expect(await (await driver.$(landingPage.title)).isDisplayed()).toBe(true);
    expect(await (await driver.$(landingPage.cartBtn)).isDisplayed()).toBe(true);

    // 2. Hero Banner
    await expect(await (await driver.$(landingPage.heroBanner)).isDisplayed()).toBe(true);
    await expect(await (await driver.$(landingPage.shopAllBtn)).isDisplayed()).toBe(true);

    // 3. Category Sections
    const casualBanner = await driver.$(landingPage.categoryCasual);
    expect(await casualBanner.isDisplayed()).toBe(true);
    
    // Verify name and item count (No arrow here)
    const casualDesc = await casualBanner.getAttribute('content-desc');
    expect(casualDesc).toContain('Casual');
    expect(casualDesc).toContain('8 items');

    await gestures.scrollDown(0.6);
    
    const bohoBanner = await driver.$(landingPage.categoryBoho);
    expect(await bohoBanner.isDisplayed()).toBe(true);
    expect(await bohoBanner.getAttribute('content-desc')).toContain('Boho');

    await gestures.scrollUp(0.6);
  });

  test('TC-C02: should verify the Cart empty state from Homepage', async ({ driver }) => {
    // 1. Click Cart icon from Home
    await (await driver.$(landingPage.cartBtn)).click();
    await cartPage.waitForPageLoad();

    // 2. Header Verification (Including the Back Arrow icon)
    expect(await (await driver.$(cartPage.backBtn)).isDisplayed()).toBe(true);
    expect(await (await driver.$(cartPage.cartTitle)).isDisplayed()).toBe(true);

    // 3. Verify Empty State Content
    expect(await (await driver.$(cartPage.emptyCartMsg)).isDisplayed()).toBe(true);
    expect(await (await driver.$(cartPage.continueShoppingBtn)).isDisplayed()).toBe(true);

    // 4. Return to Home via Continue Shopping
    await cartPage.clickContinueShopping();
    await landingPage.waitForPageLoad();
    expect(await (await driver.$(landingPage.title)).isDisplayed()).toBe(true);
  });

  test('TC-C03: should verify the "All Dresses" page default state (via Shop All)', async ({ driver }) => {
    await landingPage.navigateToShopAll();
    await gridPage.waitForPageLoad();

    expect(await (await driver.$(gridPage.navMenuBtn)).isDisplayed()).toBe(true);
    expect(await (await driver.$(gridPage.gridTitle)).isDisplayed()).toBe(true);
    expect(await (await driver.$(gridPage.sortBtn)).isDisplayed()).toBe(true);
    expect(await (await driver.$(gridPage.cartBtn)).isDisplayed()).toBe(true);

    expect(await (await driver.$(gridPage.searchInput)).isDisplayed()).toBe(true);

    expect(await (await driver.$(gridPage.resultCount)).isDisplayed()).toBe(true);
    const countText = await (await driver.$(gridPage.resultCount)).getAttribute('content-desc');
    expect(countText).toMatch(/Showing \d+ of \d+ items/);

    const firstProduct = await driver.$(gridPage.productCard('Black Sequin Mini'));
    expect(await firstProduct.isDisplayed()).toBe(true);
    
    const productDesc = await firstProduct.getAttribute('content-desc');
    expect(productDesc).toContain('$');
    
    const innerCartBtn = await firstProduct.$(gridPage.addToCartBtn);
    expect(await innerCartBtn.isDisplayed()).toBe(true);

    const visibleCount = await gridPage.getVisibleProductCount();
    expect(visibleCount).toBeGreaterThanOrEqual(4);
  });

  test('TC-C04: should verify dynamic metadata updates during full-page scroll', async ({ driver }) => {
    const initialText = await (await driver.$(gridPage.resultCount)).getAttribute('content-desc');
    expect(initialText).toContain('Showing');

    const reachedBottom = await gridPage.scrollToBottomAndVerifyMetadata();
    expect(reachedBottom).toBe(true);
    
    const finalMetadata = await (await driver.$(gridPage.resultCount)).getAttribute('content-desc');
    const match = finalMetadata.match(/Showing (\d+) of (\d+) items/);
    if (match) {
      expect(match[1]).toBe(match[2]);
    }
  });
});
