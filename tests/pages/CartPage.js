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

    // Cart line items — ImageView with content-desc `<Name>\n$<total>\n<qty>`.
    // Total label is a View (not ImageView), so filtering by ImageView + "$"
    // isolates lines cleanly. Verified against `dumps/cart_with_items.xml`.
    this.lineItem = this.isAndroid
      ? 'android=new UiSelector().className("android.widget.ImageView").descriptionContains("$")'
      : '~cart-line-item';
  }

  async waitForPageLoad() {
    await this.waitForDisplayed(this.cartTitle);
  }

  async clickContinueShopping() {
    const btn = await this.driver.$(this.continueShoppingBtn);
    await btn.click();
  }

  /**
   * Count cart line items currently rendered. Caller is responsible for
   * scrolling first if the cart is longer than the viewport.
   */
  async getLineCount() {
    const lines = await this.driver.$$(this.lineItem);
    return lines.length;
  }
}

module.exports = { CartPage };
