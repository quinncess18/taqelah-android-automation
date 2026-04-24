// @ts-check
const { BasePage } = require('./BasePage');

/**
 * CatalogPage — Page Object Model for the Home/Catalog screen.
 */
class CatalogPage extends BasePage {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    super(driver);
    
    // Header Selectors
    this.navMenuBtn = 'android=new UiSelector().description("Open navigation menu")';
    this.searchTriggerBtn = 'android=new UiSelector().className("android.widget.Button").instance(1)'; // Top right button
    this.cartBtn = 'android=new UiSelector().description("Cart")'; // Might be the same instance
    
    // Content Selectors
    this.shopAllBtn = 'android=new UiSelector().className("android.widget.Button").description("Shop All")';
    this.viewAllCategoriesBtn = 'android=new UiSelector().className("android.widget.Button").description("View All")';
    
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
   * Open the search interface
   */
  async openSearch() {
    await (await this.driver.$(this.searchTriggerBtn)).click();
    await this.driver.pause(1000);
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

module.exports = { CatalogPage };
