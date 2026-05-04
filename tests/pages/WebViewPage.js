// @ts-check
const { BasePage } = require('./BasePage');

/**
 * WebViewPage — POM for the in-app WebView browser screen.
 * The WebView loads an external website (https://www.taqelah.sg) inside the app
 * using an embedded android.webkit.WebView widget with a native URL bar and controls.
 */
class WebViewPage extends BasePage {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    super(driver);

    // Header
    this.title = this.isAndroid
      ? 'android=new UiSelector().description("WebView")'
      : '~WebView';

    // URL Bar
    this.urlInput = this.isAndroid
      ? 'android=new UiSelector().className("android.widget.EditText")'
      : '~url-input';

    this.goBtn = this.isAndroid
      ? 'android=new UiSelector().className("android.widget.Button").description("Go")'
      : '~go-button';

    // WebView Container
    this.webViewContainer = this.isAndroid
      ? 'android=new UiSelector().className("android.webkit.WebView")'
      : '~webview-container';

    // Bottom Navigation Bar (browser controls)
    // Note: Bottom buttons are NAF (Not Accessibility Friendly) in the XML dump,
    // so they lack content-desc attributes. Using className + bounds-based
    // instance indexing as a fallback. These are informational only — the spec
    // does not interact with them directly.
    // Button instance order across the full hierarchy:
    //   instance(0) = Back (header), instance(1) = Go (URL bar),
    //   instance(2) = bottom btn 1, instance(3) = bottom btn 2,
    //   instance(4) = bottom btn 3
    this.bottomNavBack = this.isAndroid
      ? 'android=new UiSelector().className("android.widget.Button").instance(2)'
      : '~browser-back';

    this.bottomNavForward = this.isAndroid
      ? 'android=new UiSelector().className("android.widget.Button").instance(3)'
      : '~browser-forward';

    this.bottomNavRefresh = this.isAndroid
      ? 'android=new UiSelector().className("android.widget.Button").instance(4)'
      : '~browser-refresh';
  }

  async waitForPageLoad() {
    await this.waitForDisplayed(this.title);
    await this.driver.pause(this.settlePause);
  }

  /**
   * Returns the current URL text from the URL input field.
   * @returns {Promise<string>}
   */
  async getCurrentUrl() {
    const el = await this.driver.$(this.urlInput);
    return await el.getText();
  }

  /**
   * Checks if the WebView container is present and visible on screen.
   * @returns {Promise<boolean>}
   */
  async isWebViewDisplayed() {
    return await this.isVisible(this.webViewContainer);
  }

  /**
   * Navigate back to the previous app screen using the header Back button.
   */
  async goBack() {
    const btn = await this.driver.$(this.backBtn);
    await btn.click();
    await this.driver.pause(this.settlePause);
  }

  /**
   * Clears the URL input field and types a new URL, then presses Go.
   * @param {string} url - The URL to navigate to (e.g. "https://www.google.com")
   */
  async navigateToUrl(url) {
    // Clear existing URL
    await this.clearField(this.urlInput);
    await this.driver.pause(500);

    // Type the new URL
    const input = await this.driver.$(this.urlInput);
    await input.setValue(url);
    await this.driver.pause(500);

    // Press Go button
    const go = await this.driver.$(this.goBtn);
    await go.click();
    await this.driver.pause(this.settlePause);
  }
}

module.exports = { WebViewPage };
