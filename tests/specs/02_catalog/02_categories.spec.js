// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
const { ProductGridPage } = require('../../pages/ProductGridPage');
const { CartPage } = require('../../pages/CartPage');
const products = require('../../data/products');

test.describe('Catalog Module - Category Data & Functional Integrity', () => {
  let loginPage;
  let landingPage;
  let gridPage;
  let cartPage;

  test.beforeAll(async ({ driver }) => {
    loginPage = new LoginPage(driver);
    landingPage = new CatalogLandingPage(driver);
    gridPage = new ProductGridPage(driver);
    cartPage = new CartPage(driver);

    // SELF-HEALING: Ensure we are logged in and on the Homepage
    const isLoggedOut = await loginPage.isVisible(loginPage.loginButton);
    if (isLoggedOut) {
      await loginPage.login(loginPage.defaultUser, loginPage.defaultPass);
      await landingPage.waitForPageLoad();
    }

    const onHome = await landingPage.isVisible(landingPage.shopAllBtn);
    if (!onHome) {
      await landingPage.deviceBack();
      await landingPage.waitForPageLoad();
    }
  });

  async function performCategoryFunctionalAudit(data) {
    await landingPage.selectCategory(data.name);
    await gridPage.waitForPageLoad();

    const sorts = ['LowHigh', 'HighLow', 'ZA', 'AZ'];
    for (let i = 0; i < sorts.length; i++) {
      await gridPage.openSortMenu();
      await gridPage.selectSort(sorts[i]);
      if (i === 0) await gridPage.nudgeToRevealFirstItem();

      const details = await gridPage.getFirstProductDetails();
      const anchor = sorts[i] === 'LowHigh' ? data.anchors.cheapest :
                     sorts[i] === 'HighLow' ? data.anchors.mostExpensive :
                     sorts[i] === 'ZA' ? data.anchors.alphaLast : data.anchors.alphaFirst;

      expect(details).toContain(anchor);
    }

    const integrityPass = await gridPage.verifyCategoryIntegrity(data);
    expect(integrityPass).toBe(true);

    await gridPage.navigateToCart();
    await cartPage.waitForPageLoad();
    expect(await cartPage.isVisible(cartPage.cartTitle)).toBe(true);

    await cartPage.clickContinueShopping();
    await gridPage.waitForPageLoad();

    await gridPage.deviceBack();
    await landingPage.waitForPageLoad();
  }

  test('TC-C08: should verify Casual Dresses data and functional integrity', async ({ driver }) => {
    await performCategoryFunctionalAudit(products.categories.casual);
  });

  test('TC-C09: should verify Evening Dresses data and functional integrity', async ({ driver }) => {
    await performCategoryFunctionalAudit(products.categories.evening);
  });

  test('TC-C10: should verify Party Dresses data and functional integrity', async ({ driver }) => {
    await performCategoryFunctionalAudit(products.categories.party);
  });

  test('TC-C11: should verify Boho Dresses data and functional integrity', async ({ driver }) => {
    await performCategoryFunctionalAudit(products.categories.boho);
  });
});
