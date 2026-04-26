// @ts-check
const { debugLog } = require('../utils/Logger');

/**
 * BasePage — Foundational Page Object for Taqelah.
 * Encapsulates common driver interactions, waits, and W3C gestures.
 */
class BasePage {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    this.driver = driver;
    
    // Platform Detection
    this.isAndroid = driver.isAndroid;
    this.isIOS = driver.isIOS;

    // Shared Header Selectors
    this.title = this.isAndroid 
      ? 'android=new UiSelector().description("DemoApp")' 
      : '~DemoApp';
    
    this.navMenuBtn = this.isAndroid 
      ? 'android=new UiSelector().description("Open navigation menu")' 
      : '~Open navigation menu';

    // Dimensions will be fetched dynamically or on-demand to ensure accuracy
  }

  /**
   * Clear text from an EditText field.
   * Essential for Flutter stability to ensure clean input.
   * @param {string} selector 
   */
  async clearField(selector) {
    const el = await this.driver.$(selector);
    await el.click();
    await el.clearValue();
    await this.driver.pause(500);
  }

  /**
   * Helper to perform a coordinate-based swipe (W3C Actions).
   * @param {number} startX 
   * @param {number} startY 
   * @param {number} endX 
   * @param {number} endY 
   * @param {number} duration
   */
  async swipe(startX, startY, endX, endY, duration = 1200) {
    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: duration, origin: 'viewport', x: endX, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);
    await this.driver.pause(800);
  }

  /**
   * Universal Swipe Up (Scroll Down).
   * Targets the 30% safe zone to avoid system handles.
   */
  async swipeUp() {
    const { width, height } = await this.driver.getWindowRect();
    const safeX = Math.round(width * 0.3);
    const startY = Math.round(height * 0.7);
    const endY = Math.round(height * 0.3);
    await this.swipe(safeX, startY, safeX, endY);
  }

  /**
   * Intelligently check if an element is within the visible viewport.
   * More reliable than isDisplayed() for Flutter edge elements.
   * @param {string} selector 
   */
  async isInsideViewport(selector) {
    try {
      const el = await this.driver.$(selector);
      if (!(await el.isDisplayed())) return false;

      const { y } = await el.getLocation();
      const { height: elHeight } = await el.getSize();
      const { height: screenHeight } = await this.driver.getWindowRect();

      const elCenterY = y + (elHeight / 2);
      
      // COMFORT ZONE: Center of element must be between 20% and 80% of screen height
      return elCenterY >= (screenHeight * 0.2) && elCenterY <= (screenHeight * 0.8);
    } catch (err) {
      return false;
    }
  }

  /**
   * Wait for an element to be displayed.
   */
  async waitForDisplayed(selector, timeout = 10000) {
    const el = await this.driver.$(selector);
    await el.waitForDisplayed({ timeout });
    return el;
  }
}

module.exports = { BasePage };
