// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
const { ProductGridPage } = require('../../pages/ProductGridPage');
const { ProductDetailPage } = require('../../pages/ProductDetailPage');
const { CartPage } = require('../../pages/CartPage');
const { NavMenuPage } = require('../../pages/NavMenuPage');

test.describe('Products Module — Product Detail + Add to Cart', () => {
  let loginPage;
  let landingPage;
  let gridPage;
  let detailPage;
  let cartPage;
  let navMenu;
  // Cascade-shared state: PD03 stores the chosen Casual product so PD04 can
  // assert the exact snackbar text after Add to Cart.
  let casualPick;

  test.beforeAll(async ({ driver }) => {
    // Disable UIA2's "wait for a11y tree to be idle" gate. On Flutter
    // screens with continuous animations or image hydration (e.g. the
    // product Detail page on CI's hardware-constrained Pixel 6), the
    // bridge is rarely "idle" within UIA2's default 10s window — the
    // instrumentation then crashes mid-wait and Playwright's retry kicks
    // in against a dead session, cascading 0ms failures down the spec.
    // Setting this to 0 makes UIA2 query the a11y tree immediately on
    // each poll without an idle precondition. Persists for the session.
    try { await driver.updateSettings({ waitForIdleTimeout: 0 }); } catch {}

    loginPage = new LoginPage(driver);
    landingPage = new CatalogLandingPage(driver);
    gridPage = new ProductGridPage(driver);
    detailPage = new ProductDetailPage(driver);
    cartPage = new CartPage(driver);
    navMenu = new NavMenuPage(driver);

    const isLoggedOut = await loginPage.isVisible(loginPage.loginButton);
    if (isLoggedOut) {
      // On tablet, waitForPageLoad does a resetToTop so credential fields
      // are interactable before setValue. Without it, fields silently no-op
      // and the form submits empty → stays on Login screen.
      await loginPage.waitForPageLoad();
      await loginPage.login(loginPage.defaultUser, loginPage.defaultPass);
    }
    await landingPage.waitForPageLoad();

    // Wide-screen orientation lock — done AFTER login because the Auth
    // module is already known-good in tablet's default landscape, while
    // the product flow needs portrait proportions for grid cards (tall)
    // and Detail's bottom action bar to fit a non-wide viewport.
    //
    // Appium UIA2 does NOT expose `mobile: setOrientation`, and the W3C
    // `driver.setOrientation()` silently no-ops. The working path is
    // `mobile: shell` (Appium server must be started with
    // `--allow-insecure adb_shell` — see package.json's `appium:start`)
    // to set Android's system `user_rotation` directly. Pixel Tablet's
    // natural orientation is landscape, so user_rotation=1 rotates 90°
    // to portrait.
    const { width } = await driver.getWindowRect();
    if (width > 1200) {
      try {
        await driver.execute('mobile: shell', { command: 'settings', args: ['put', 'system', 'accelerometer_rotation', '0'] });
        await driver.execute('mobile: shell', { command: 'settings', args: ['put', 'system', 'user_rotation', '1'] });
        await driver.pause(2500); // Flutter re-layout after rotation
        await landingPage.waitForPageLoad();
      } catch (e) {
        console.log(`[beforeAll] orientation lock failed: ${e?.message || e}`);
      }
    }
  });

  test('TC-PD01: should open Product Detail from Shop All and render full layout', async ({ driver }) => {
    // Catalog Landing → Shop All
    await landingPage.navigateToShopAll();
    await gridPage.waitForPageLoad();

    // Random product → tap → Detail
    const pick = await gridPage.pickRandomProduct();
    expect(pick.price).toMatch(/^\$\d+(\.\d{2})?$/);
    await pick.el.click();

    await detailPage.waitForPageLoad();

    expect(await detailPage.isVisible(detailPage.byContentDesc(pick.name))).toBe(true);
    expect(await detailPage.isVisible(detailPage.byContentDesc(pick.price))).toBe(true);
    expect(await detailPage.isVisible(detailPage.colorLabel)).toBe(true);
    expect(await detailPage.isVisible(detailPage.colorSwatch(0))).toBe(true);
    expect(await detailPage.isVisible(detailPage.colorSwatch(1))).toBe(true);
    expect(await detailPage.isVisible(detailPage.colorSwatch(2))).toBe(true);
    expect(await detailPage.isVisible(detailPage.byContentDesc('1'))).toBe(true); // default qty
    expect(await detailPage.isVisible(detailPage.addToCartBtn)).toBe(true);
  });

  test('TC-PD02: should treat each color as a variant — 2 swatches → 2 cart lines', async ({ driver }) => {
    // Cascade entry: PD01 left us on Product Detail.
    await detailPage.waitForPageLoad();

    // Variant 1 — color swatch 0
    await detailPage.selectColorByInstance(0);
    const snack1 = await detailPage.addToCart();
    expect(snack1).toMatch(/^.+ added to cart$/);

    // Wait for the first snackbar to disappear before the next add — otherwise
    // the next descriptionContains("added to cart") wait returns the stale one.
    await detailPage.waitForSnackbarDismissed();

    // Variant 2 — color swatch 1 on the SAME product
    await detailPage.selectColorByInstance(1);
    const snack2 = await detailPage.addToCart();
    expect(snack2).toBe(snack1); // same product name regardless of color variant

    // Verify variant model: 2 cart lines, not 1 line of qty=2.
    // Detail has no cart icon → route via Back to Shop All.
    await detailPage.waitForSnackbarDismissed();
    await driver.back();
    await gridPage.waitForPageLoad();
    const gridCartBtn = await driver.$(gridPage.cartBtn);
    await gridCartBtn.click();
    await cartPage.waitForPageLoad();

    expect(await cartPage.getLineCount()).toBe(2);

    // Leave on Shop All so PD03 starts from the same anchor.
    await driver.back();
    await gridPage.waitForPageLoad();
  });

  test('TC-PD03: should carry cart badge=2 across navigation to a Category product Detail', async ({ driver }) => {
    // Cascade entry: PD02 left us on Shop All with badge=2.
    await gridPage.waitForPageLoad();
    expect(await gridPage.getCartBadgeCount()).toBe(2);

    // Drawer → Home → Catalog Landing
    await navMenu.open();
    await navMenu.navigateTo(navMenu.navHome);
    await landingPage.waitForPageLoad();

    // Casual category card → grid
    await landingPage.selectCategory('Casual');
    await gridPage.waitForPageLoad();

    // Badge persists across navigation
    expect(await gridPage.getCartBadgeCount()).toBe(2);

    // Random Casual product → tap → Detail (navigation only — no add here)
    casualPick = await gridPage.pickRandomProduct();
    await casualPick.el.click();
    await detailPage.waitForPageLoad();

    // Strong anchor: Detail title matches the product we picked from the Casual grid
    expect(await detailPage.isVisible(detailPage.byContentDesc(casualPick.name))).toBe(true);
    expect(await detailPage.isVisible(detailPage.addToCartBtn)).toBe(true);
  });

  test('TC-PD04: should add the Casual product to cart and bump badge to 3', async ({ driver }) => {
    // Cascade entry: PD03 left us on the Casual product Detail page.
    await detailPage.waitForPageLoad();

    const snack = await detailPage.addToCart();
    expect(snack).toBe(`${casualPick.name} added to cart`);

    await detailPage.waitForSnackbarDismissed();
    await driver.back();
    await gridPage.waitForPageLoad();

    expect(await gridPage.getCartBadgeCount()).toBe(3);
  });

  test('TC-PD05: should navigate from Casual back to Catalog Landing then into Evening grid', async ({ driver }) => {
    // Cascade entry: PD04 left us on the Casual grid with badge=3.
    await driver.back();
    await landingPage.waitForPageLoad();

    await landingPage.selectCategory('Evening');
    await gridPage.waitForPageLoad();

    // Grid title proves we landed in Evening specifically (not just "any grid").
    // Category grids title themselves as "<Category> Dresses" — same pattern as
    // Shop All's "All Dresses".
    expect(await gridPage.isVisible(gridPage.gridTitle('Evening Dresses'))).toBe(true);

    // Badge persists across the back+forward navigation
    expect(await gridPage.getCartBadgeCount()).toBe(3);
  });

  test('TC-PD06: should add a product directly from the Evening card icon (no Detail visit) and bump badge to 4', async ({ driver }) => {
    // Cascade entry: PD05 left us on the Evening grid with badge=3.
    await gridPage.waitForPageLoad();

    // Pick a random Evening product whose direct-add button is currently
    // rendered. Partial cards at the bottom of the viewport lack the child
    // Button in the a11y tree until scrolled into view — the filter handles
    // that without scroll choreography.
    const pick = await gridPage.pickRandomProductDirectAdd();
    await pick.addBtn.click();

    const snackText = await gridPage.getAddedSnackbarText();
    expect(snackText).toBe(`${pick.name} added to cart`);

    await gridPage.waitForSnackbarDismissed();
    expect(await gridPage.getCartBadgeCount()).toBe(4);
  });

  test('TC-SR01: should filter Party grid to "Cocktail" matches and add all 3 from the search results', async ({ driver }) => {
    // Cascade entry: PD06 left us on Evening grid with badge=4.
    await driver.back();
    await landingPage.waitForPageLoad();
    await landingPage.selectCategory('Party');
    await gridPage.waitForPageLoad();

    expect(await gridPage.isVisible(gridPage.gridTitle('Party Dresses'))).toBe(true);

    await gridPage.searchProducts('Cocktail');

    // Party has 3 cocktail-named products: Lace, Mint, Navy. Read the
    // "Showing N of M items" counter to know the expected match count —
    // tablet portrait may not show all matches in one viewport, so we
    // scroll-and-iterate to add each as it comes into view.
    const counterText = await (await driver.$(gridPage.resultCount)).getAttribute('content-desc');
    const counterMatch = counterText.match(/Showing\s+(\d+)\s+of\s+\d+\s+items/);
    const expectedMatchCount = counterMatch ? parseInt(counterMatch[1], 10) : 3;
    expect(expectedMatchCount).toBe(3);

    // Bottom-up add pattern (handles the slower-than-phone snackbar
    // dismiss on rotated tablet): first scroll the grid DOWN so the
    // bottom-most match is in the viewport, then add visible matches
    // BOTTOM-UP. Between iterations we scroll UP to reveal earlier
    // matches. The scroll itself serves as the natural snackbar-dismiss
    // delay between adds, so we never tap the next card while the
    // previous snackbar is still alive in the a11y tree.
    const { width, height } = await driver.getWindowRect();
    const safeX = Math.round(width * 0.3);

    // Initial scroll down — bring bottom-most match into view
    await gridPage.swipe(safeX, Math.round(height * 0.7), safeX, Math.round(height * 0.3), 800);
    await driver.pause(gridPage.settlePause);

    const added = new Set();
    let lastBadge = 4;
    const maxIterations = 5;
    for (let iter = 0; iter < maxIterations; iter++) {
      // Reverse so we tap bottom-most first within the current viewport
      const visible = (await gridPage.getVisibleProductNames()).reverse();
      for (const name of visible) {
        if (added.has(name)) continue;
        await gridPage.tapDirectAddByName(name);
        const snackText = await gridPage.getAddedSnackbarText();
        expect(snackText).toBe(`${name} added to cart`);
        await gridPage.waitForSnackbarDismissed();
        added.add(name);
        lastBadge += 1;
        expect(await gridPage.getCartBadgeCount()).toBe(lastBadge);
      }
      if (added.size >= expectedMatchCount) break;
      // Scroll UP to reveal earlier matches in the filtered set
      await gridPage.swipe(safeX, Math.round(height * 0.3), safeX, Math.round(height * 0.7), 800);
      await driver.pause(gridPage.settlePause);
    }
    expect(added.size).toBe(expectedMatchCount);
  });

  test('TC-SR02: should show empty state when searching Boho for an off-catalog clothing term', async ({ driver }) => {
    // Cascade entry: SR01 left us on filtered Party grid.
    await driver.back();
    await landingPage.waitForPageLoad();
    await landingPage.selectCategory('Boho');
    await gridPage.waitForPageLoad();

    expect(await gridPage.isVisible(gridPage.gridTitle('Boho Dresses'))).toBe(true);

    await gridPage.searchProducts('shorts');

    // Zero matching cards is the structural assertion (works regardless of
    // whether the empty-state UI shows "No Results Found" or just a counter
    // of 0 — we'll dump and pin the exact text in a follow-up if useful).
    expect(await gridPage.getVisibleProductNames()).toHaveLength(0);

    // Badge unchanged across the negative search
    expect(await gridPage.getCartBadgeCount()).toBe(7);
  });
});
