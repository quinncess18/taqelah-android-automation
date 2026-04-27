// @ts-check
const { BasePage } = require('./BasePage');

/**
 * CatalogLandingPage — POM for the marketing-focused Homepage.
 * Universally safe for Phone, Tablet, and iPad.
 */
class CatalogLandingPage extends BasePage {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    super(driver);
    
    // Header Selectors
    this.cartBtn = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.Button").instance(1)' 
      : '~cart-icon';
    
    // Hero Section (Combined multi-line string from UI dump)
    this.heroBanner = this.isAndroid 
      ? 'android=new UiSelector().description("New Collection\nExplore the latest trends in women\'s fashion")' 
      : '~hero-banner';
    
    this.shopAllBtn = this.isAndroid 
      ? 'android=new UiSelector().description("Shop All")' 
      : '~shop-all';
    
    // Category Headers
    this.sectionHeader = this.isAndroid
      ? 'android=new UiSelector().description("Shop by Category")'
      : '~section-header-category';

    this.viewAllCategoriesBtn = this.isAndroid 
      ? 'android=new UiSelector().description("View All")' 
      : '~view-all-categories';
    
    // Category Cards (Exact multi-line strings as buttons)
    this.categoryCasual = this.isAndroid 
      ? 'android=new UiSelector().description("Casual\nEveryday comfort & style\n8 items")' 
      : '~category-casual';
    
    this.categoryEvening = this.isAndroid 
      ? 'android=new UiSelector().description("Evening\nElegant gowns & formal wear\n8 items")' 
      : '~category-evening';
    
    this.categoryParty = this.isAndroid 
      ? 'android=new UiSelector().description("Party\nCocktail & party dresses\n8 items")' 
      : '~category-party';
    
    this.categoryBoho = this.isAndroid 
      ? 'android=new UiSelector().description("Boho\nFree-spirited & artistic\n8 items")' 
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
   * Select a category by name. 
   * Uses fuzzy matching to ensure the correct card is picked even with naming variations.
   */
  async selectCategory(name) {
    let selector;
    if (name.includes('Casual')) selector = this.categoryCasual;
    else if (name.includes('Evening')) selector = this.categoryEvening;
    else if (name.includes('Party')) selector = this.categoryParty;
    else selector = this.categoryBoho;
      
    const el = await this.driver.$(selector);
    if (!(await this.isInsideViewport(selector))) {
      await this.scrollToCategory(name);
    }
    await el.click();
  }

  /**
   * Intelligently scroll to a specific category banner.
   * Performs a single, fluid 50% swipe if the element is not centered.
   */
  async scrollToCategory(name) {
    let selector;
    if (name.includes('Casual')) selector = this.categoryCasual;
    else if (name.includes('Evening')) selector = this.categoryEvening;
    else if (name.includes('Party')) selector = this.categoryParty;
    else selector = this.categoryBoho;
    
    // SMART FLUID CHECK: If the center of the category is not in the comfort zone, swipe once.
    if (!(await this.isInsideViewport(selector))) {
      const { width, height } = await this.driver.getWindowRect();
      const safeX = Math.round(width * 0.3);
      
      // Fluid 50% Height Swipe (Pulls content UP)
      await this.swipe(safeX, Math.round(height * 0.7), safeX, Math.round(height * 0.2), 1200);
      await this.driver.pause(600);
    }
  }
}

module.exports = { CatalogLandingPage };
