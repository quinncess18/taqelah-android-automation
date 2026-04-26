// @ts-check

/**
 * Gestures — Utility class for W3C Touch Actions in Taqelah.
 * Designed for Flutter canvas where native UiScrollable is unavailable.
 * Universally safe for Phones, Tablets, and iPads.
 */
class Gestures {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    this.driver = driver;
  }

  /**
   * Generic swipe with improved visibility and momentum.
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
          { type: 'pause', duration: 100 }, // Brief hold to ensure momentum
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);
    await this.driver.pause(1000); // Allow Flutter to render the new viewport
  }

  /**
   * Adaptive Scroll to Top (Swipe Down).
   * Targets the 30% width safe zone to avoid system handles.
   */
  async scrollToTop() {
    const { width, height } = await this.driver.getWindowRect();
    const safeX = Math.round(width * 0.3);
    const startY = Math.round(height * 0.2);
    const endY = Math.round(height * 0.85);

    await this.swipe(safeX, startY, safeX, endY, 2000); // Slow, visible drag
  }

  /**
   * Scroll down (Swipe up).
   * Targets the "Middle-Slice" (20% to 50% height) to avoid keyboard and system handles.
   */
  async scrollDown(percentage = 0.3) {
    const { width, height } = await this.driver.getWindowRect();
    const safeX = Math.round(width * 0.3);
    const startY = Math.round(height * 0.5);
    const endY = Math.round(height * (0.5 - percentage));
    await this.swipe(safeX, startY, safeX, endY, 1500);
  }

  /**
   * Scroll up (Swipe down).
   * Targets the "Middle-Slice" (20% to 50% height).
   */
  async scrollUp(percentage = 0.3) {
    const { width, height } = await this.driver.getWindowRect();
    const safeX = Math.round(width * 0.3);
    const startY = Math.round(height * 0.2);
    const endY = Math.round(height * (0.2 + percentage));
    await this.swipe(safeX, startY, safeX, endY, 1500);
  }
}

module.exports = { Gestures };
