// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
const { ProductGridPage } = require('../../pages/ProductGridPage');
const { CartPage } = require('../../pages/CartPage');
const products = require('../../data/products');

test.describe('Catalog Module - Landing UI Master Check', () => {
  let loginPage;
  let landingPage;
  let gridPage;
  let cartPage;

  test.beforeAll(async ({ driver }) => {
    loginPage = new LoginPage(driver);
    landingPage = new CatalogLandingPage(driver);
    gridPage = new ProductGridPage(driver);
    cartPage = new CartPage(driver);

    // SELF-HEALING: Ensure we are logged in before catalog tests
    const isLoggedOut = await loginPage.isVisible(loginPage.loginButton);
    if (isLoggedOut) {
      await loginPage.login(loginPage.defaultUser, loginPage.defaultPass);
      await landingPage.waitForPageLoad();
    }
  });

  test('TC-C01: should verify Homepage comprehensive UI and adaptive scroll', async ({ driver }) => {
    await landingPage.waitForPageLoad();

    expect(await landingPage.isVisible(landingPage.navMenuBtn)).toBe(true);
    expect(await landingPage.isVisible(landingPage.title)).toBe(true);

    await landingPage.scrollToCategory('Boho');
    expect(await landingPage.isVisible(landingPage.categoryBoho)).toBe(true);

    await landingPage.resetToTop();
    expect(await landingPage.isVisible(landingPage.heroBanner)).toBe(true);
  });

  test('TC-C02: should verify the Cart empty state from Homepage', async ({ driver }) => {
    await landingPage.navigateToCart();
    await cartPage.waitForPageLoad();

    expect(await cartPage.isVisible(cartPage.cartTitle)).toBe(true);
    expect(await cartPage.isVisible(cartPage.emptyCartMsg)).toBe(true);

    await cartPage.clickContinueShopping();
    await landingPage.waitForPageLoad();
  });

  test('TC-C03: should verify the "All Dresses" page default state', async ({ driver }) => {
    await landingPage.navigateToShopAll();
    await gridPage.waitForPageLoad();

    const firstProduct = await gridPage.getFirstProductDetails();
    expect(firstProduct).toContain(products.anchors.alphaFirst.name);
  });

  test('TC-C04: should verify Full Catalog Data Integrity', async ({ driver }) => {
    test.setTimeout(180000);
    const catalogIntact = await gridPage.verifyFullCatalogIntegrity();
    expect(catalogIntact).toBe(true);
  });

  test('TC-C05: should verify all sorting modes using Universal Truths', async ({ driver }) => {
    const sorts = [
      { mode: 'LowHigh', anchor: products.anchors.cheapest.price },
      { mode: 'HighLow', anchor: products.anchors.mostExpensive.price },
      { mode: 'ZA', anchor: products.anchors.alphaLast.name },
      { mode: 'AZ', anchor: products.anchors.alphaFirst.name },
    ];

    const { width } = await driver.getWindowRect();
    const isTablet = width > 1200;

    await gridPage.resetToTop(3);

    for (let i = 0; i < sorts.length; i++) {
      await gridPage.openSortMenu();
      await gridPage.selectSort(sorts[i].mode);

      if (i === 0) {
        await gridPage.resetToTop(isTablet ? 3 : 2);
      }

      const details = await gridPage.getFirstProductDetails();
      expect(details).toContain(sorts[i].anchor);
    }
  });

  test('TC-C06: should verify Cart empty state from Grid', async ({ driver }) => {
    await gridPage.navigateToCart();
    await cartPage.waitForPageLoad();
    expect(await cartPage.isVisible(cartPage.cartTitle)).toBe(true);

    await cartPage.clickContinueShopping();
    await gridPage.waitForPageLoad();
  });

  test('TC-C07: should verify the "View All" hyperlink routing', async ({ driver }) => {
    await gridPage.deviceBack();
    await landingPage.waitForPageLoad();

    await landingPage.navigateToViewAll();
    await gridPage.waitForPageLoad();

    const firstProduct = await gridPage.getFirstProductDetails();
    expect(firstProduct).toContain(products.anchors.alphaFirst.name);
  });
});
