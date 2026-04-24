// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
const { ProductGridPage } = require('../../pages/ProductGridPage');
const { Gestures } = require('../../utils/Gestures');

test.describe('Catalog Module - Landing & Shop All', () => {
  let loginPage;
  let landingPage;
  let gridPage;
  let gestures;

  test.beforeAll(async ({ driver }) => {
    loginPage = new LoginPage(driver);
    landingPage = new CatalogLandingPage(driver);
    gridPage = new ProductGridPage(driver);
    gestures = new Gestures(driver);
  });

  test('TC-C01: should complete login correction and verify Homepage default state', async ({ driver }) => {
    // 1. Picking up from TC-N03 (Login Error State)
    await loginPage.waitForPageLoad();
    
    // Clear invalid password; username is already present
    await loginPage.clearField(loginPage.passwordField);
    await loginPage.login(null, '10203040');

    await landingPage.waitForPageLoad();

    // 2. Header Verification
    expect(await (await driver.$(landingPage.navMenuBtn)).isDisplayed()).toBe(true);
    expect(await (await driver.$(landingPage.title)).isDisplayed()).toBe(true);
    expect(await (await driver.$(landingPage.cartBtn)).isDisplayed()).toBe(true);

    // 3. Hero Banner & Primary Action
    expect(await (await driver.$(landingPage.heroBanner)).isDisplayed()).toBe(true);
    expect(await (await driver.$(landingPage.shopAllBtn)).isDisplayed()).toBe(true);

    // 4. Category Section Audit
    const categoryHeader = await driver.$('android=new UiSelector().description("Shop by Category")');
    expect(await categoryHeader.isDisplayed()).toBe(true);
    expect(await (await driver.$(landingPage.viewAllCategoriesBtn)).isDisplayed()).toBe(true);

    // 5. Category Banner Verification (Upper Half)
    const casualBanner = await driver.$(landingPage.categoryCasual);
    const eveningBanner = await driver.$(landingPage.categoryEvening);
    
    expect(await casualBanner.isDisplayed()).toBe(true);
    expect(await eveningBanner.isDisplayed()).toBe(true);
    
    expect(await casualBanner.getAttribute('content-desc')).toContain('8 items');
    expect(await eveningBanner.getAttribute('content-desc')).toContain('8 items');

    // 6. Scrollability & Verification (Lower Half)
    await gestures.scrollDown(0.6);
    
    const partyBanner = await driver.$(landingPage.categoryParty);
    const bohoBanner = await driver.$(landingPage.categoryBoho);
    
    expect(await partyBanner.isDisplayed()).toBe(true);
    expect(await bohoBanner.isDisplayed()).toBe(true);
    
    expect(await partyBanner.getAttribute('content-desc')).toContain('8 items');
    expect(await bohoBanner.getAttribute('content-desc')).toContain('8 items');

    // Return to top
    await gestures.scrollUp(0.6);
  });

  test('TC-C02: should verify the "All Dresses" page default state (via Shop All)', async ({ driver }) => {
    // 1. Navigation Transition
    await landingPage.navigateToShopAll();
    await gridPage.waitForPageLoad();

    // 2. Header & Sorting Verification
    expect(await (await driver.$(gridPage.navMenuBtn)).isDisplayed()).toBe(true);
    expect(await (await driver.$(gridPage.gridTitle)).isDisplayed()).toBe(true);
    expect(await (await driver.$(gridPage.sortBtn)).isDisplayed()).toBe(true);
    expect(await (await driver.$(gridPage.cartBtn)).isDisplayed()).toBe(true);

    // 3. Search Interface
    expect(await (await driver.$(gridPage.searchInput)).isDisplayed()).toBe(true);

    // 4. Metadata Check (Result Count)
    expect(await (await driver.$(gridPage.resultCount)).isDisplayed()).toBe(true);
    const countText = await (await driver.$(gridPage.resultCount)).getAttribute('content-desc');
    expect(countText).toMatch(/Showing \d+ of \d+ items/);

    // 5. Product Card Component Audit
    const firstProduct = await driver.$(gridPage.productCard('Black Sequin Mini'));
    expect(await firstProduct.isDisplayed()).toBe(true);
    
    const productDesc = await firstProduct.getAttribute('content-desc');
    expect(productDesc).toContain('$');
    
    const innerCartBtn = await firstProduct.$(gridPage.addToCartBtn);
    expect(await innerCartBtn.isDisplayed()).toBe(true);

    // 6. Viewport Capacity Check
    const visibleCount = await gridPage.getVisibleProductCount();
    expect(visibleCount).toBeGreaterThanOrEqual(4);
  });
});
