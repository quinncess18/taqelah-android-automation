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
  }

  async waitForPageLoad() {
    await this.waitForDisplayed(this.cartTitle);
  }

  async clickContinueShopping() {
    const btn = await this.driver.$(this.continueShoppingBtn);
    await btn.click();
  }
}

module.exports = { CartPage };
