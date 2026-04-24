// @ts-check
const { BasePage } = require('./BasePage');

/**
 * LoginPage — Page Object Model for the Taqelah Demo App login screen.
 */
class LoginPage extends BasePage {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    super(driver);
    
    // Core Selectors
    this.usernameField = 'android=new UiSelector().className("android.widget.EditText").instance(0)';
    this.passwordField = 'android=new UiSelector().className("android.widget.EditText").instance(1)';
    this.loginButton = 'android=new UiSelector().className("android.widget.Button").description("Login")';
    
    // Error Message Selectors (Discovered via User Hint & Dump)
    this.mainError = 'android=new UiSelector().descriptionStartsWith("Invalid username or password")';
    this.usernameFieldError = 'android=new UiSelector().description("Please enter your username")';
    this.passwordFieldError = 'android=new UiSelector().description("Please enter your password")';
    this.passwordToggle = 'android=new UiSelector().className("android.widget.EditText").instance(1).childSelector(new UiSelector().className("android.widget.Button"))';
    
    // Navigation Selectors
    this.logoutBtn = 'android=new UiSelector().className("android.widget.Button").description("Logout")';
  }

  async waitForPageLoad() {
    await this.waitForDisplayed(this.title);
    await this.driver.pause(1000); 
  }

  /**
   * Perform logout from the app
   */
  async logout() {
    await (await this.driver.$(this.navMenuBtn)).click();
    await this.driver.pause(1000);
    
    // Scroll down in side menu to find Logout if not visible
    const logoutEl = await this.driver.$(this.logoutBtn);
    if (!(await logoutEl.isDisplayed())) {
      await this.swipe(400, 2000, 400, 500); // Swipe up in the drawer
    }
    await logoutEl.click();
    await this.waitForDisplayed(this.usernameField);
  }

  /**
   * Toggle password visibility (the "eye" icon)
   */
  async togglePasswordVisibility() {
    const toggle = await this.driver.$(this.passwordToggle);
    await toggle.click();
  }

  /**
   * Check if password field is masked
   */
  async isPasswordMasked() {
    const passEl = await this.driver.$(this.passwordField);
    return (await passEl.getAttribute('password')) === 'true';
  }

  /**
   * Get value of the username field
   */
  async getUsernameValue() {
    return await (await this.driver.$(this.usernameField)).getText();
  }

  /**
   * Perform login action.
   */
  async login(username, password) {
    const userEl = await this.driver.$(this.usernameField);
    if (username !== null) {
      await userEl.click();
      await userEl.clearValue();
      await this.driver.pause(500);
      await userEl.addValue(username);
    }

    const passEl = await this.driver.$(this.passwordField);
    if (password !== null) {
      await passEl.click();
      await passEl.clearValue();
      await this.driver.pause(500);
      await passEl.addValue(password);
    }

    await this.driver.pause(500);

    if (await this.driver.isKeyboardShown()) {
      await this.driver.hideKeyboard();
    }

    const btnEl = await this.driver.$(this.loginButton);
    await btnEl.click();
  }

  /**
   * Verify if specific error is displayed
   */
  async getErrorMessage(type) {
    const selector = type === 'main' ? this.mainError : 
                     type === 'username' ? this.usernameFieldError : 
                     this.passwordFieldError;
    try {
      const el = await this.driver.$(selector);
      // Ensure element is not just present but visible/stable
      await el.waitForDisplayed({ timeout: 8000 });
      return await el.getAttribute('content-desc');
    } catch (err) {
      console.warn(`[LoginPage] Error not found for type ${type}: ${err.message}`);
      return null;
    }
  }
}

module.exports = { LoginPage };
