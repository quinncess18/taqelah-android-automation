// @ts-check
const { BasePage } = require('./BasePage');

/**
 * LoginPage — POM for the Taqelah Demo App login screen.
 * Universally safe for Phone, Tablet, and iPad.
 */
class LoginPage extends BasePage {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    super(driver);
    
    // Core Selectors (Cross-Platform Flutter TestKeys)
    this.usernameField = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.EditText").instance(0)' 
      : '~username-field';
    
    this.passwordField = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.EditText").instance(1)' 
      : '~password-field';
    
    this.loginButton = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.Button").description("Login")' 
      : '~Login';
    
    // Error Message Selectors
    this.mainError = this.isAndroid 
      ? 'android=new UiSelector().descriptionStartsWith("Invalid username or password")' 
      : '~error-message';
    
    this.usernameFieldError = this.isAndroid 
      ? 'android=new UiSelector().description("Please enter your username")' 
      : '~username-error';
    
    this.passwordFieldError = this.isAndroid 
      ? 'android=new UiSelector().description("Please enter your password")' 
      : '~password-error';
    
    this.passwordToggle = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.EditText").instance(1).childSelector(new UiSelector().className("android.widget.Button"))' 
      : '~toggle-password';
    
    this.logoutBtn = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.Button").description("Logout")' 
      : '~Logout';

    this.demoCredentials = this.isAndroid 
      ? 'android=new UiSelector().description("Demo Credentials")' 
      : '~demo-credentials';

    // Universal Truths (Demo Credentials)
    this.defaultUser = 'emma@demoapp.com';
    this.defaultPass = '10203040';
  }

  async waitForPageLoad() {
    await this.waitForDisplayed(this.title);
    await this.driver.pause(1000); 
  }

  /**
   * Perform logout from the app using adaptive gestures.
   */
  async logout() {
    // SYNC: Wait for UI to settle after potential relaunch (handles splash screen lag)
    const menuBtn = await this.waitForDisplayed(this.navMenuBtn, 20000);
    await menuBtn.click();
    await this.driver.pause(1000);
    
    const { width, height } = await this.driver.getWindowRect();
    const safeDrawerX = Math.round(width * 0.2); 
    
    await this.swipe(safeDrawerX, Math.round(height * 0.8), safeDrawerX, Math.round(height * 0.2), 1000);
    await this.driver.pause(500);

    const logoutEl = await this.driver.$(this.logoutBtn);
    await logoutEl.click();
    await this.waitForDisplayed(this.usernameField);
  }

  async togglePasswordVisibility() {
    const toggle = await this.driver.$(this.passwordToggle);
    await toggle.click();
  }

  /**
   * Universally verifies that the password field is correctly masked.
   * Checks for the bullet character (•) and ensures the item count matches.
   */
  async verifyPasswordMasked(expectedCount) {
    const el = await this.driver.$(this.passwordField);
    const text = this.isAndroid ? await el.getText() : await el.getAttribute('value');
    
    // Verify count and symbol
    const bulletsOnly = text.split('').every(char => char === '•');
    if (text.length !== expectedCount || (expectedCount > 0 && !bulletsOnly)) {
      throw new Error(`Masking verification failed. Expected ${expectedCount} bullets, got "${text}"`);
    }
    return true;
  }

  /**
   * Universally verifies the plaintext content of the password field.
   */
  async verifyPasswordPlaintext(expectedText) {
    const el = await this.driver.$(this.passwordField);
    const text = this.isAndroid ? await el.getText() : await el.getAttribute('value');
    if (text !== expectedText) {
      throw new Error(`Plaintext verification failed. Expected "${expectedText}", got "${text}"`);
    }
    return true;
  }

  /**
   * Universally verifies the content of the username field.
   */
  async verifyUsername(expectedText) {
    const el = await this.driver.$(this.usernameField);
    const text = await el.getText();
    if (text !== expectedText) {
      throw new Error(`Username verification failed. Expected "${expectedText}", got "${text}"`);
    }
    return true;
  }

  /**
   * Universal helper to fill out the login form without submitting.
   * Hardened for Keyboard, Toolbar, and Stylus input methods.
   */
  async fillCredentials(username, password) {
    if (username !== null) {
      await this.clearField(this.usernameField);
      const userEl = await this.driver.$(this.usernameField);
      await userEl.click(); // Force focus for Stylus/Toolbar
      await userEl.setValue(username); // setValue is more robust for OS buffers
    }

    if (password !== null) {
      await this.clearField(this.passwordField);
      const passEl = await this.driver.$(this.passwordField);
      await passEl.click(); // Force focus
      await passEl.setValue(password);
    }

    await this.driver.pause(500);
    try {
      if (await this.driver.isKeyboardShown()) {
        this.isAndroid ? await this.driver.back() : await this.driver.hideKeyboard();
        await this.driver.pause(1000); 
      }
    } catch (e) {}
  }

  /**
   * Fill ONLY the password field while preserving the username.
   */
  async fillPasswordOnly(password) {
    await this.clearField(this.passwordField);
    const passEl = await this.driver.$(this.passwordField);
    await passEl.addValue(password);
    
    await this.driver.pause(500);
    try {
      if (await this.driver.isKeyboardShown()) {
        this.isAndroid ? await this.driver.back() : await this.driver.hideKeyboard();
        await this.driver.pause(1000); 
      }
    } catch (e) {}
  }

  /**
   * Powerful cross-platform login engine.
   */
  async login(username, password) {
    await this.fillCredentials(username, password);
    const btnEl = await this.driver.$(this.loginButton);
    await btnEl.waitForDisplayed({ timeout: 5000 });
    await btnEl.click();
  }

  /**
   * Intelligently reveals the Demo Credentials section.
   */
  async revealDemoCredentials() {
    // SMART CHECK: Only scroll if it's actually outside the viewport
    if (!(await this.isInsideViewport(this.demoCredentials))) {
      const { width, height } = await this.driver.getWindowRect();
      const safeX = Math.round(width * 0.3);
      await this.swipe(safeX, Math.round(height * 0.45), safeX, Math.round(height * 0.15), 1500);
      await this.driver.pause(1000);
    }
  }

  async getErrorMessage(type) {
    const selector = type === 'main' ? this.mainError : 
                     type === 'username' ? this.usernameFieldError : 
                     this.passwordFieldError;
    try {
      const el = await this.driver.$(selector);
      await el.waitForDisplayed({ timeout: 8000 });
      return await el.getAttribute('content-desc');
    } catch (err) {
      return null;
    }
  }
}

module.exports = { LoginPage };
