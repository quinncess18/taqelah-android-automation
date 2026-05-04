// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
const { NavMenuPage } = require('../../pages/NavMenuPage');
const { WebViewPage } = require('../../pages/WebViewPage');

test.describe('Navigation - WebView / In-App Browser (TC-W01-W03)', () => {
  let landingPage;
  let navMenu;
  let webViewPage;

  test.beforeAll(async ({ driver }) => {
    landingPage = new CatalogLandingPage(driver);
    navMenu = new NavMenuPage(driver);
    webViewPage = new WebViewPage(driver);

    // SELF-HEALING: Return to DemoApp Homepage if deep-linked
    let onHome = await landingPage.isVisible(landingPage.shopAllBtn);
    let retryCount = 0;
    while (!onHome && retryCount < 3) {
      await driver.back();
      await driver.pause(1000);
      onHome = await landingPage.isVisible(landingPage.shopAllBtn);
      retryCount++;
    }
  });

  test('TC-W01: should verify WebView opens and displays the Taqelah website correctly', async ({ driver }) => {
    // Start from DemoApp Homepage — navigate to WebView
    await navMenu.open();
    await navMenu.navigateTo(navMenu.navWebView);
    await webViewPage.waitForPageLoad();

    // Verify the WebView screen elements are present
    expect(await webViewPage.isVisible(webViewPage.title)).toBe(true);
    expect(await webViewPage.isVisible(webViewPage.urlInput)).toBe(true);
    expect(await webViewPage.isVisible(webViewPage.goBtn)).toBe(true);

    // Verify the URL bar contains the Taqelah website URL
    const currentUrl = await webViewPage.getCurrentUrl();
    expect(currentUrl).toContain('taqelah.sg');

    // Verify the WebView container is present (page loaded)
    expect(await webViewPage.isWebViewDisplayed()).toBe(true);

    // Stay on WebView screen — TC-W02 continues from here (no Back navigation)
  });

  test('TC-W02: should navigate to a new URL using the Go button', async ({ driver }) => {
    // Pause between test cases for session stability
    await driver.pause(2000);

    // Navigate to a lightweight site using the URL bar and Go button
    await webViewPage.navigateToUrl('https://example.com');

    // Wait for the new page to load
    await driver.pause(3000);

    // Verify the URL bar now shows example.com
    const newUrl = await webViewPage.getCurrentUrl();
    expect(newUrl).toContain('example.com');

    // Stay on WebView screen — TC-W03 continues from here (no Back navigation)
  });

  test('TC-W03: should verify WebView Back returns to the app with state preserved', async ({ driver }) => {
    // Pause between test cases for session stability
    await driver.pause(2000);

    // Navigate back using the header Back button
    await webViewPage.goBack();

    // Verify we're back on the DemoApp Home screen
    expect(await landingPage.isVisible(landingPage.shopAllBtn)).toBe(true);
  });
});
