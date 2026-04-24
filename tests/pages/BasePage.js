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

    // Shared Header Selectors (Global across app)
    this.title = 'android=new UiSelector().description("DemoApp")';
    this.navMenuBtn = 'android=new UiSelector().description("Open navigation menu")';
  }

  /**
   * Clear text from an EditText field.
   * @param {string} selector 
   */
  async clearField(selector) {
    const el = await this.driver.$(selector);
    await el.click();
    await el.clearValue();
  }

  /**
   * Helper to perform a coordinate-based swipe (W3C Actions).
   * Essential for Flutter canvas which doesn't support UiScrollable.
   * 
   * @param {number} startX 
   * @param {number} startY 
   * @param {number} endX 
   * @param {number} endY 
   */
  async swipe(startX, startY, endX, endY) {
    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 1200, origin: 'viewport', x: endX, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);
    // Allow UI to settle
    await this.driver.pause(this.driver._deviceProfile?.settlePause || 800);
  }

  /**
   * Swipe Up (Scroll Down) helper.
   */
  async swipeUp() {
    const { width, height } = await this.driver.getWindowRect();
    const centerX = Math.round(width / 2);
    // Smaller, more deliberate scroll (from 60% to 40%)
    const startY = Math.round(height * 0.6);
    const endY = Math.round(height * 0.3);
    await this.swipe(centerX, startY, centerX, endY);
  }

  /**
   * Wait for an element to be displayed.
   * @param {string} selector 
   * @param {number} timeout 
   */
  async waitForDisplayed(selector, timeout = 10000) {
    const el = await this.driver.$(selector);
    await el.waitForDisplayed({ timeout });
    return el;
  }
}

module.exports = { BasePage };
