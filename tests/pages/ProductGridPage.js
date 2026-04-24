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
    this.gridTitle = 'android=new UiSelector().description("All Dresses")';
    this.sortBtn = 'android=new UiSelector().className("android.widget.Button").instance(2)';
    this.cartBtn = 'android=new UiSelector().className("android.widget.Button").instance(3)';
    
    // Search & Metadata
    this.searchInput = 'android=new UiSelector().className("android.widget.EditText")';
    this.resultCount = 'android=new UiSelector().descriptionContains("Showing")';
    
    // Grid Elements
    this.productCard = (name) => `android=new UiSelector().className("android.widget.ImageView").descriptionContains("${name}")`;
    this.addToCartBtn = 'android=new UiSelector().className("android.widget.Button")';
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
    const items = await this.driver.$$('android=new UiSelector().className("android.widget.ImageView").clickable(true)');
    return items.length;
  }
}

module.exports = { ProductGridPage };
