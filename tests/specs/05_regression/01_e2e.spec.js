// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
const { ProductGridPage } = require('../../pages/ProductGridPage');
const { ProductDetailPage } = require('../../pages/ProductDetailPage');
const { CartPage } = require('../../pages/CartPage');
const { ShippingInfoPage } = require('../../pages/ShippingInfoPage');
const { ReviewOrderPage } = require('../../pages/ReviewOrderPage');
const { ThankYouPage } = require('../../pages/ThankYouPage');
const checkoutData = require('../../data/checkout-scenarios.json');

// ─────────────────────────────────────────────────────────────────────────────
// §16 Regression — full cross-module E2E. Runs LAST in the suite as a final
// integration check. Has its own pm clear + relaunch so it never inherits
// state from earlier specs (it's the regression layer, not a chained spec).
//
// TC-E01: a single user's full purchase funnel, from cold launch to
// completed order — touches Auth, Catalog, Products, Cart, Checkout in
// one serial journey. Fails meaningfully only when a cross-module
// integration breaks (every unit spec passed but the joints did not).
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Regression (§16) — full E2E', () => {
  /** @type {LoginPage} */ let loginPage;
  /** @type {CatalogLandingPage} */ let landingPage;
  /** @type {ProductGridPage} */ let gridPage;
  /** @type {ProductDetailPage} */ let detailPage;
  /** @type {CartPage} */ let cartPage;
  /** @type {ShippingInfoPage} */ let shippingPage;
  /** @type {ReviewOrderPage} */ let reviewPage;
  /** @type {ThankYouPage} */ let thankYouPage;

  test.beforeAll(async ({ driver }) => {
    loginPage = new LoginPage(driver);
    landingPage = new CatalogLandingPage(driver);
    gridPage = new ProductGridPage(driver);
    detailPage = new ProductDetailPage(driver);
    cartPage = new CartPage(driver);
    shippingPage = new ShippingInfoPage(driver);
    reviewPage = new ReviewOrderPage(driver);
    thankYouPage = new ThankYouPage(driver);

    // Hard reset — regression starts from a cold app, ignoring whatever
    // earlier specs left behind. pm clear + am force-stop + am start.
    await driver.execute('mobile: shell', { command: 'pm', args: ['clear', loginPage.appPackage] });
    await driver.pause(2500);
    await driver.execute('mobile: shell', { command: 'am', args: ['start', '-W', '-n', `${loginPage.appPackage}/.MainActivity`] });
    await driver.pause(1500);
    try { await driver.updateSettings({ waitForIdleTimeout: 0 }); } catch {}

    // Defensive: wait for the Login UI to actually be usable before the
    // TC body runs. Without this the first login() can fire while the
    // username field isn't yet bound in the a11y tree → setValue silently
    // targets nothing → submit happens with empty fields → app stays on
    // Login → landing.waitForPageLoad() times out (observed first run).
    await loginPage.waitForDisplayed(loginPage.usernameField, 20000);
    await loginPage.waitForDisplayed(loginPage.passwordField, 5000);
    await loginPage.waitForDisplayed(loginPage.loginButton, 5000);
  });

  test('TC-E01: full single-product purchase journey — cold launch to badge cleared', async ({ driver }) => {
    // ── Login ──
    await loginPage.waitForPageLoad();
    await loginPage.login(loginPage.defaultUser, loginPage.defaultPass);
    await landingPage.waitForPageLoad();

    // Tablet portrait lock (post-login per §12 pattern — landscape makes
    // product cards taller than viewport, breaking the a11y tree).
    const { width } = await driver.getWindowRect();
    if (width > 1200) {
      try {
        await driver.execute('mobile: shell', { command: 'settings', args: ['put', 'system', 'accelerometer_rotation', '0'] });
        await driver.execute('mobile: shell', { command: 'settings', args: ['put', 'system', 'user_rotation', '1'] });
        await driver.pause(2500);
        await landingPage.waitForPageLoad();
      } catch (e) {
        console.log(`[E01] portrait lock failed: ${e?.message || e}`);
      }
    }

    // ── Catalog → Shop All → random product → Detail ──
    await landingPage.navigateToShopAll();
    await gridPage.waitForPageLoad();
    const pick = await gridPage.pickRandomProduct();
    console.log(`[E01] picked: "${pick.name}" ${pick.price}`);
    await pick.el.click();
    await detailPage.waitForPageLoad();
    expect(await detailPage.isVisible(detailPage.byContentDesc(pick.name))).toBe(true);

    // ── Add to Cart ──
    await detailPage.addToCart();
    await detailPage.waitForSnackbarDismissed();

    // ── Back to grid → assert badge=1 → open Cart ──
    await driver.back();
    await gridPage.waitForPageLoad();
    expect(await gridPage.getCartBadgeCount()).toBe(1);
    const cartIcon = await driver.$(gridPage.cartBtn);
    await cartIcon.click();
    await cartPage.waitForPageLoad();

    // ── Verify cart contents ──
    const cartLines = await cartPage.collectAllLines();
    expect(cartLines).toHaveLength(1);
    expect(cartLines[0].name).toBe(pick.name);
    expect(cartLines[0].qty).toBe(1);
    const cartTotal = await cartPage.getCartTotal();
    expect(cartTotal).toBeCloseTo(cartLines[0].total, 2);

    // ── Proceed to Checkout → fill Shipping ──
    await cartPage.tapProceedToCheckout();
    await shippingPage.waitForPageLoad();
    const customer = checkoutData.valid[0].customer;
    await shippingPage.fillForm(customer);

    // ── To Payment → Review matches Cart ──
    await shippingPage.tapToPayment();
    await reviewPage.waitForPageLoad();

    const reviewLines = await reviewPage.getOrderSummaryLines();
    expect(reviewLines).toHaveLength(1);
    expect(reviewLines[0].name).toBe(pick.name);
    expect(reviewLines[0].qty).toBe(1);
    expect(reviewLines[0].total).toBeCloseTo(cartLines[0].total, 2);
    const reviewTotal = await reviewPage.getTotal();
    expect(reviewTotal).toBeCloseTo(cartTotal, 2);

    // ── Place Order → Thank You ──
    await reviewPage.tapPlaceOrder();
    await thankYouPage.waitForPageLoad();
    expect(await thankYouPage.isVisible(thankYouPage.title)).toBe(true);
    expect(await thankYouPage.isVisible(thankYouPage.continueShoppingBtn)).toBe(true);

    // ── Continue Shopping → Landing + badge cleared ──
    await thankYouPage.tapContinueShopping();
    await landingPage.waitForPageLoad();
    expect(await landingPage.isVisible(landingPage.shopAllBtn)).toBe(true);
    expect(await gridPage.isVisible(gridPage.cartBadge)).toBe(false);
  });

  // Revert tablet to landscape so nothing downstream inherits the lock.
  test.afterAll(async ({ driver }) => {
    const { width } = await driver.getWindowRect();
    if (width > 1200) {
      try {
        await driver.execute('mobile: shell', { command: 'settings', args: ['put', 'system', 'user_rotation', '0'] });
        await driver.execute('mobile: shell', { command: 'settings', args: ['put', 'system', 'accelerometer_rotation', '1'] });
        await driver.pause(2000);
      } catch (e) {
        console.log(`[E01/afterAll] orientation revert failed: ${e?.message || e}`);
      }
    }
  });
});
