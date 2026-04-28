// @ts-check
const { BasePage } = require('./BasePage');

/**
 * AboutPage — POM for the information/about screen.
 */
class AboutPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.title = this.isAndroid ? 'android=new UiSelector().description("About")' : '~About';
    this.version = this.isAndroid ? 'android=new UiSelector().descriptionContains("Version")' : '~version-info';
    this.backBtn = this.isAndroid ? 'android=new UiSelector().description("Back")' : '~back-button';
    
    // Bottom Elements
    this.darkModeSwitch = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.Switch").description("Dark Mode")' 
      : '~dark-mode-switch';
    
    this.footerUrl = this.isAndroid ? 'android=new UiSelector().description("www.taqelah.sg")' : '~official-url';
    this.footerFlutter = this.isAndroid ? 'android=new UiSelector().description("Built with Flutter")' : '~flutter-logo';
  }

  async waitForPageLoad() {
    await this.waitForDisplayed(this.title);
  }

  /**
   * Perform a calibrated power-tug to reach the absolute bottom.
   * Uses 60% depth for Tablets to ensure footer visibility.
   */
  async scrollToBottom() {
    const { width, height } = await this.driver.getWindowRect();
    const isTablet = width > 1200;
    const safeX = Math.round(width * 0.5);
    const endY = isTablet ? 0.2 : 0.08; // 60% throw for tablet, 72% for mobile
    
    await this.swipe(safeX, Math.round(height * 0.8), safeX, Math.round(height * endY), 1000);
    await this.driver.pause(1000);
  }

  /**
   * Logical verification of the Dark Mode switch attribute.
   */
  async getDarkModeState() {
    const toggle = await this.driver.$(this.darkModeSwitch);
    const attr = this.isAndroid ? 'checked' : 'value';
    return await toggle.getAttribute(attr);
  }
}

module.exports = { AboutPage };
