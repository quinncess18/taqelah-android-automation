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
    
    this.cartTitle = this.isAndroid 
      ? 'android=new UiSelector().description("My Cart")' 
      : '~My Cart';
    
    this.emptyCartMsg = this.isAndroid 
      ? 'android=new UiSelector().description("Your cart is empty")' 
      : '~empty-cart-message';
    
    this.continueShoppingBtn = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.Button").description("Continue Shopping")' 
      : '~Continue Shopping';
    
    this.backBtn = this.isAndroid 
      ? 'android=new UiSelector().description("Back")' 
      : '~Back';
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
