// @ts-check

/**
 * Gestures — Utility class for W3C Touch Actions in Taqelah.
 * Designed for Flutter canvas where native UiScrollable is unavailable.
 */
class Gestures {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    this.driver = driver;
  }

  /**
   * Generic swipe from one coordinate to another.
   * @param {number} startX 
   * @param {number} startY 
   * @param {number} endX 
   * @param {number} endY 
   * @param {number} duration 
   */
  async swipe(startX, startY, endX, endY, duration = 600) {
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
   * Scroll down (Swipe up).
   * @param {number} percentage How much of the screen to swipe (0.1 to 1.0)
   */
  async scrollDown(percentage = 0.5) {
    const { width, height } = await this.driver.getWindowRect();
    const centerX = Math.round(width / 2);
    const startY = Math.round(height * 0.8);
    const endY = Math.round(height * (0.8 - percentage));
    await this.swipe(centerX, startY, centerX, endY);
  }

  /**
   * Scroll up (Swipe down).
   * @param {number} percentage 
   */
  async scrollUp(percentage = 0.5) {
    const { width, height } = await this.driver.getWindowRect();
    const centerX = Math.round(width / 2);
    const startY = Math.round(height * 0.2);
    const endY = Math.round(height * (0.2 + percentage));
    await this.swipe(centerX, startY, centerX, endY);
  }
}

module.exports = { Gestures };
