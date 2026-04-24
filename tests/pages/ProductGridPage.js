// @ts-check
const { BasePage } = require('./BasePage');

/**
 * ProductGridPage — POM for the "All Dresses" search and listing screen.
 */
class ProductGridPage extends BasePage {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    super(driver);
    
    // Header Selectors
    this.gridTitle = this.isAndroid 
      ? 'android=new UiSelector().description("All Dresses")' 
      : '~All Dresses';
    
    this.sortBtn = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.Button").instance(2)' 
      : '~sort-button';
    
    this.cartBtn = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.Button").instance(3)' 
      : '~cart-icon';
    
    // Search & Metadata
    this.searchInput = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.EditText")' 
      : '~search-input';
    
    this.resultCount = this.isAndroid 
      ? 'android=new UiSelector().descriptionContains("Showing")' 
      : '~result-count';
    
    // Grid Elements
    this.productCard = (name) => this.isAndroid 
      ? `android=new UiSelector().className("android.widget.ImageView").descriptionContains("${name}")` 
      : `~product-${name.toLowerCase().replace(/ /g, '-')}`;
    
    this.addToCartBtn = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.Button")' 
      : '~add-to-cart';
  }

  async waitForPageLoad() {
    await this.waitForDisplayed(this.resultCount);
  }

  /**
   * Search for a specific term
   * @param {string} term 
   */
  async searchForItem(term) {
    const search = await this.driver.$(this.searchInput);
    await search.click();
    await search.addValue(term);
    await this.driver.pause(1000); // Allow results to filter
  }

  /**
   * Add a specific product to the cart
   * @param {string} name 
   */
  async addProductToCart(name) {
    const card = await this.driver.$(this.productCard(name));
    if (!(await card.isDisplayed())) {
      await this.swipeUp();
    }
    const btn = await card.$(this.addToCartBtn);
    await btn.click();
    await this.driver.pause(500);
  }

  /**
   * Get the current count of visible products
   */
  async getVisibleProductCount() {
    const selector = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.ImageView").clickable(true)' 
      : '~product-item';
    const items = await this.driver.$$(selector);
    return items.length;
  }

  /**
   * Perform a full scroll to the bottom, verifying metadata updates along the way.
   * @returns {Promise<boolean>} True if total items reached
   */
  async scrollToBottomAndVerifyMetadata() {
    let isAtEnd = false;
    let scrollCount = 0;
    const maxScrolls = 20;

    while (!isAtEnd && scrollCount < maxScrolls) {
      const text = await (await this.driver.$(this.resultCount)).getAttribute('content-desc');
      const match = text.match(/Showing (\d+) of (\d+) items/);
      
      if (!match) break;
      
      const current = parseInt(match[1], 10);
      const total = parseInt(match[2], 10);
      
      console.log(`[Scroll Debug] Progress: ${current}/${total} items shown.`);

      if (current >= total) {
        isAtEnd = true;
        await this.swipeUp();
        await this.swipeUp();
      } else {
        await this.swipeUp();
        scrollCount++;
        await this.driver.pause(1000); 
      }
    }
    return isAtEnd;
  }
}

module.exports = { ProductGridPage };
