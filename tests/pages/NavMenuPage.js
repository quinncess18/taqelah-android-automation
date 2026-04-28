// @ts-check
const { BasePage } = require('./BasePage');

/**
 * NavMenuPage — Dedicated POM for the Global Navigation Drawer.
 * Handles routing, settings toggles, and user context.
 */
class NavMenuPage extends BasePage {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    super(driver);

    // Structural Selectors
    this.menuDrawer = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.ScrollView")' 
      : '~nav-drawer';

    // Account Section
    this.userProfile = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.ImageView").descriptionContains("@")' 
      : '~user-profile';
    
    this.logoutBtn = this.isAndroid 
      ? 'android=new UiSelector().description("Logout")' 
      : '~logout-button';

    // Main Navigation
    this.navHome = this.isAndroid ? 'android=new UiSelector().description("Home")' : '~nav-home';
    this.navCart = this.isAndroid ? 'android=new UiSelector().description("Cart")' : '~nav-cart';
    this.navAbout = this.isAndroid ? 'android=new UiSelector().description("About")' : '~nav-about';

    // Settings
    this.darkModeToggle = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.Switch").description("Dark Mode")' 
      : '~dark-mode-switch';

    // Test Suite (Test Screens)
    this.navGestures = this.isAndroid ? 'android=new UiSelector().description("Gestures")' : '~nav-gestures';
    this.navWebView = this.isAndroid ? 'android=new UiSelector().description("WebView")' : '~nav-webview';
    this.navDialogs = this.isAndroid ? 'android=new UiSelector().description("Dialogs & Alerts")' : '~nav-dialogs';
    this.navForm = this.isAndroid ? 'android=new UiSelector().description("Form Validation")' : '~nav-form';
    this.navPermissions = this.isAndroid ? 'android=new UiSelector().description("Permissions")' : '~nav-permissions';
    this.navNotifications = this.isAndroid ? 'android=new UiSelector().description("Notifications")' : '~nav-notifications';
    this.navTabs = this.isAndroid ? 'android=new UiSelector().description("Tabs & Navigation")' : '~nav-tabs';
    this.navCamera = this.isAndroid ? 'android=new UiSelector().description("Camera")' : '~nav-camera';
    this.navLocation = this.isAndroid ? 'android=new UiSelector().description("Location")' : '~nav-location';

    // Headers / Non-clickable
    this.testScreensHeader = this.isAndroid 
      ? 'android=new UiSelector().description("TEST SCREENS")' 
      : '~test-screens-header';

    // Global Header Elements
    this.menuButton = this.isAndroid 
      ? 'android=new UiSelector().description("Open navigation menu")' 
      : '~open-menu';
    
    this.demoAppTitle = this.isAndroid 
      ? 'android=new UiSelector().description("DemoApp")' 
      : '~demo-app-title';
  }

  /**
   * Open the navigation drawer from any screen.
   */
  async open() {
    const btn = await this.driver.$(this.menuButton);
    await btn.click();
    await this.waitForPageLoad();
  }

  /**
   * Helper to wait for the drawer to be fully animated and visible.
   */
  async waitForPageLoad() {
    await this.driver.pause(800); // Standard drawer animation time
    await this.waitForDisplayed(this.navHome);
  }

  /**
   * Universal scroll within the drawer to find a specific link.
   * Uses a smaller swipe depth to avoid overshooting in the narrow drawer.
   */
  async scrollToItem(selector) {
    const el = await this.driver.$(selector);
    let scrollCount = 0;
    while (!(await el.isDisplayed()) && scrollCount < 5) {
      const { width, height } = await this.driver.getWindowRect();
      const safeX = Math.round(width * 0.3); // Inside drawer width
      await this.swipe(safeX, Math.round(height * 0.7), safeX, Math.round(height * 0.3), 800);
      scrollCount++;
    }
  }

  /**
   * Perform navigation to a specific module.
   * Auto-scrolls if the item is below the fold (e.g. Logout, Location).
   */
  async navigateTo(selector) {
    await this.scrollToItem(selector);
    const btn = await this.driver.$(selector);
    await btn.click();
  }

  /**
   * Returns the current theme status (checked/unchecked).
   * Ternary-safe for both Android and iOS attributes.
   */
  async isDarkModeActive() {
    const toggle = await this.driver.$(this.darkModeToggle);
    const attr = this.isAndroid ? 'checked' : 'value';
    const state = await toggle.getAttribute(attr);
    return state === 'true' || state === '1';
  }
}

module.exports = { NavMenuPage };
