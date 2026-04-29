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
}

module.exports = { GesturesPage };
