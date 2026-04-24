// @ts-check
const { BasePage } = require('./BasePage');

/**
 * CartPage — POM for the Shopping Cart screen.
 */
class CartPage extends BasePage {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    super(driver);
    
    this.cartTitle = 'android=new UiSelector().description("My Cart")';
    this.emptyCartMsg = 'android=new UiSelector().description("Your cart is empty")';
    this.continueShoppingBtn = 'android=new UiSelector().className("android.widget.Button").description("Continue Shopping")';
    this.backBtn = 'android=new UiSelector().description("Back")';
  }

  async waitForPageLoad() {
    await this.waitForDisplayed(this.cartTitle);
  }

  /**
   * Navigate back to the previous screen via the header back button
   */
  async goBack() {
    const btn = await this.driver.$(this.backBtn);
    await btn.click();
  }

  /**
   * Click continue shopping to return to the catalog
   */
  async clickContinueShopping() {
    const btn = await this.driver.$(this.continueShoppingBtn);
    await btn.click();
  }
}

module.exports = { CartPage };
