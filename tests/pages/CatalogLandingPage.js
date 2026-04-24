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
    this.cartBtn = 'android=new UiSelector().className("android.widget.Button").instance(1)'; 
    
    // Home Screen Content
    this.heroBanner = 'android=new UiSelector().descriptionStartsWith("New Collection")';
    this.shopAllBtn = 'android=new UiSelector().description("Shop All")';
    this.viewAllCategoriesBtn = 'android=new UiSelector().description("View All")';
    
    // Categories
    this.categoryCasual = 'android=new UiSelector().descriptionStartsWith("Casual")';
    this.categoryEvening = 'android=new UiSelector().descriptionStartsWith("Evening")';
    this.categoryParty = 'android=new UiSelector().descriptionStartsWith("Party")';
    this.categoryBoho = 'android=new UiSelector().descriptionStartsWith("Boho")';
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
    // Verification handled by ProductGridPage
  }

  /**
   * Select a category by name
   */
  async selectCategory(name) {
    const selector = `android=new UiSelector().descriptionStartsWith("${name}")`;
    const el = await this.driver.$(selector);
    if (!(await el.isDisplayed())) {
      await this.swipeUp();
    }
    await el.click();
  }
}

module.exports = { CatalogLandingPage };
