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
    
    // Navigation Selectors
    this.logoutBtn = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.Button").description("Logout")' 
      : '~Logout';
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
    
    const logoutEl = await this.driver.$(this.logoutBtn);
    if (!(await logoutEl.isDisplayed())) {
      await this.swipe(400, 2000, 400, 500);
    }
    await logoutEl.click();
    await this.waitForDisplayed(this.usernameField);
  }

  async togglePasswordVisibility() {
    const toggle = await this.driver.$(this.passwordToggle);
    await toggle.click();
  }

  async isPasswordMasked() {
    const passEl = await this.driver.$(this.passwordField);
    return (await passEl.getAttribute('password')) === 'true';
  }

  async getUsernameValue() {
    return await (await this.driver.$(this.usernameField)).getText();
  }

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
    if (await this.driver.isKeyboardShown()) await this.driver.hideKeyboard();

    const btnEl = await this.driver.$(this.loginButton);
    await btnEl.click();
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
