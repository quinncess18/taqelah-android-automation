// @ts-check
const { BasePage } = require('./BasePage');

/**
 * CatalogLandingPage — POM for the marketing-focused Homepage.
 */
class CatalogLandingPage extends BasePage {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    super(driver);
    
    // Header Selectors (Local to Catalog)
    this.cartBtn = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.Button").instance(1)' 
      : '~cart-icon';
    
    // Home Screen Content
    this.heroBanner = this.isAndroid 
      ? 'android=new UiSelector().descriptionStartsWith("New Collection")' 
      : '~hero-banner';
    
    this.shopAllBtn = this.isAndroid 
      ? 'android=new UiSelector().description("Shop All")' 
      : '~shop-all';
    
    this.viewAllCategoriesBtn = this.isAndroid 
      ? 'android=new UiSelector().description("View All")' 
      : '~view-all-categories';
    
    // Categories
    this.categoryCasual = this.isAndroid 
      ? 'android=new UiSelector().descriptionStartsWith("Casual")' 
      : '~category-casual';
    
    this.categoryEvening = this.isAndroid 
      ? 'android=new UiSelector().descriptionStartsWith("Evening")' 
      : '~category-evening';
    
    this.categoryParty = this.isAndroid 
      ? 'android=new UiSelector().descriptionStartsWith("Party")' 
      : '~category-party';
    
    this.categoryBoho = this.isAndroid 
      ? 'android=new UiSelector().descriptionStartsWith("Boho")' 
      : '~category-boho';
  }

  async waitForPageLoad() {
    await this.waitForDisplayed(this.shopAllBtn);
  }

  /**
   * Navigate to the full product list via 'Shop All'
   */
  async navigateToShopAll() {
    const el = await this.driver.$(this.shopAllBtn);
    await el.click();
  }

  /**
   * Select a category by name
   */
  async selectCategory(name) {
    const selector = this.isAndroid 
      ? `android=new UiSelector().descriptionStartsWith("${name}")` 
      : `~category-${name.toLowerCase()}`;
      
    const el = await this.driver.$(selector);
    if (!(await el.isDisplayed())) {
      await this.swipeUp();
    }
    await el.click();
  }
}

module.exports = { CatalogLandingPage };
