// @ts-check
const { BasePage } = require('./BasePage');

/**
 * GesturesPage — POM for the Gesture interaction screen.
 * Handles Swipe, Drag, and other touch-based test scenarios.
 */
class GesturesPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.title = this.isAndroid ? 'android=new UiSelector().description("Gesture Demo")' : '~Gesture Demo';
    this.backBtn = this.isAndroid ? 'android=new UiSelector().description("Back")' : '~back-button';

    // Swipe Section
    this.swipeHeader = this.isAndroid ? 'android=new UiSelector().description("Swipe Cards")' : '~swipe-header';
    this.swipeCard = (index) => this.isAndroid 
      ? `android=new UiSelector().description("Swipe Card ${index}")` 
      : `~swipe-card-${index}`;

    // Drag & Drop Section
    this.dragHeader = this.isAndroid ? 'android=new UiSelector().description("Drag & Drop Reorder")' : '~drag-header';
    this.dragItem = (index) => this.isAndroid 
      ? `android=new UiSelector().descriptionContains("Drag Item ${index}")` 
      : `~drag-item-${index}`;
    this.dragItemExact = (position, id) => this.isAndroid
      ? `android=new UiSelector().descriptionContains("${position}\nDrag Item ${id}")`
      : `~drag-item-${id}-pos-${position}`;

    // Long Press Section
    this.longPressBtn = this.isAndroid 
      ? 'android=new UiSelector().description("Long press me for options")' 
      : '~long-press-area';

    // Tap/Zoom Sections
    this.doubleTapArea = this.isAndroid 
      ? 'android=new UiSelector().description("Double Tap to Zoom")' 
      : '~double-tap-area';

    this.pinchArea = this.isAndroid 
      ? 'android=new UiSelector().description("Pinch to Zoom")' 
      : '~pinch-area';

    // Popup/Toasts
    this.toastMsg = (text) => this.isAndroid 
      ? `android=new UiSelector().descriptionContains("${text}")` 
      : `~toast-${text}`;

    this.notificationMsg = (text) => this.isAndroid
      ? `android=new UiSelector().description("${text}")`
      : `~notification-${text}`;

    this.optionCopy = this.isAndroid ? 'android=new UiSelector().description("Copy")' : '~option-copy';
    this.optionShare = this.isAndroid ? 'android=new UiSelector().description("Share")' : '~option-share';
    this.optionDelete = this.isAndroid ? 'android=new UiSelector().description("Delete")' : '~option-delete';
  }

  async waitForPageLoad() {
    await this.waitForDisplayed(this.title);
  }

  /**
   * Scrolls down to center the Drag & Drop section in the viewport.
   * Uses fast flicks starting from the safe middle of the screen to prevent accidentally long-pressing items.
   */
  async scrollToDragSection() {
    const { width, height } = await this.driver.getWindowRect();
    const safeX = Math.round(width * 0.5);
    const isTablet = width > 1200;
    
    // Start at 60% (above the Drag items to avoid accidentally picking them up)
    const startY = Math.round(height * 0.6);
    
    // Tablet needs a ~45% screen delta (60% to 15%) to perfectly frame all 5 items.
    // Phone needs a ~35% screen delta (60% to 25%).
    const endY = isTablet ? Math.round(height * 0.15) : Math.round(height * 0.25);
    
    await this.swipe(safeX, startY, safeX, endY, 400);
    await this.driver.pause(1000);
  }

  /**
   * Scrolls to center the Zoom sections in the viewport.
   * Follows a safe path starting from 75% to avoid sensitive areas like Long Press.
   */
  async scrollToZoomSection() {
    const { width, height } = await this.driver.getWindowRect();
    const centerX = width / 2;
    // Scroll 1: Safe top-half swipe
    await this.swipe(centerX, height * 0.4, centerX, height * 0.1, 500);
    await this.driver.pause(1000);
    // Scroll 2: Start lower to avoid any intermediate long-press areas
    await this.swipe(centerX, height * 0.75, centerX, height * 0.45, 500);
    await this.driver.pause(1000);
    // Scroll 3: Final centering
    await this.swipe(centerX, height * 0.75, centerX, height * 0.45, 500);
    await this.driver.pause(1000);
  }

  /**
   * Performs a double tap on the specified coordinates.
   */
  async doubleTap(x, y) {
    await this.driver.performActions([{
      type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x, y },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerUp', button: 0 },
        { type: 'pause', duration: 100 },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);
  }

  /**
   * Performs a pinch open gesture centered at (x, y).
   */
  async pinchOpen(x, y) {
    const startX1 = x - 10;
    const startX2 = x + 10;
    const endX1 = x - 200;
    const endX2 = x + 200;
    const endY1 = y - 200;
    const endY2 = y + 200;

    await this.driver.performActions([
      {
        type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX1, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 200 },
          { type: 'pointerMove', duration: 1000, origin: 'viewport', x: endX1, y: endY1 },
          { type: 'pointerUp', button: 0 }
        ]
      },
      {
        type: 'pointer', id: 'finger2', parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX2, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 200 },
          { type: 'pointerMove', duration: 1000, origin: 'viewport', x: endX2, y: endY2 },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
  }

  /**
   * Performs a drag gesture from (startX, startY) to (endX, endY).
   */
  async drag(startX, startY, endX, endY, fingerId = 1) {
    await this.driver.performActions([{
      type: 'pointer', id: `finger${fingerId}`, parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: startX, y: startY },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 500 },
        { type: 'pointerMove', duration: 1500, origin: 'viewport', x: endX, y: endY },
        { type: 'pointerUp', button: 0 }
      ]
    }]);
  }
}

module.exports = { GesturesPage };
