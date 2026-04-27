// @ts-check
const { BasePage } = require('./BasePage');

/**
 * ProductGridPage — POM for the "All Dresses" search and listing screen.
 * Universally safe for Phone, Tablet, and iPad.
 */
class ProductGridPage extends BasePage {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    super(driver);
    
    // Header Selectors
    this.gridTitle = (name) => this.isAndroid 
      ? `android=new UiSelector().description("${name}")` 
      : `~${name}`;
    
    this.sortBtn = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.Button").instance(1)' 
      : '~sort-button';
    
    this.cartBtn = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.Button").instance(2)' 
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

    // Sort Menu Selectors
    this.sortTitle = this.isAndroid ? 'android=new UiSelector().description("Sort By")' : '~Sort By';
    this.sortOptionAZ = this.isAndroid ? 'android=new UiSelector().description("Name (A-Z)")' : '~Name (A-Z)';
    this.sortOptionZA = this.isAndroid ? 'android=new UiSelector().description("Name (Z-A)")' : '~Name (Z-A)';
    this.sortOptionPriceLowHigh = this.isAndroid ? 'android=new UiSelector().description("Price (Low-High)")' : '~Price (Low-High)';
    this.sortOptionPriceHighLow = this.isAndroid ? 'android=new UiSelector().description("Price (High-Low)")' : '~Price (High-Low)';
  }

  async waitForPageLoad() {
    await this.waitForDisplayed(this.resultCount);
  }

  /**
   * Open the sort selection menu
   */
  async openSortMenu() {
    const btn = await this.driver.$(this.sortBtn);
    await btn.click();
    await this.waitForDisplayed(this.sortTitle);
  }

  /**
   * Select a sorting option. 
   */
  async selectSort(type) {
    const selector = type === 'AZ' ? this.sortOptionAZ :
                     type === 'ZA' ? this.sortOptionZA :
                     type === 'LowHigh' ? this.sortOptionPriceLowHigh :
                     this.sortOptionPriceHighLow;
    
    const option = await this.driver.$(selector);
    await option.click();
  }

  /**
   * Universal Reset to Top (Turbo Optimized).
   */
  async resetToTop(count) {
    const { width, height } = await this.driver.getWindowRect();
    const isTablet = width > 1200;
    const safeX = Math.round(width * 0.3);
    const resetCount = count || (isTablet ? 3 : 2);

    if (!isTablet) {
      for (let i = 0; i < resetCount; i++) {
        await this.driver.performActions([
          {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', duration: 0, x: safeX, y: Math.round(height * 0.45) },
              { type: 'pointerDown', button: 0 },
              { type: 'pointerMove', duration: 400, origin: 'viewport', x: safeX, y: Math.round(height * 0.65) },
              { type: 'pointerUp', button: 0 },
            ],
          },
        ]);
        await this.driver.pause(150);
      }
    } else {
      for (let i = 0; i < resetCount; i++) {
        await this.driver.performActions([
          {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', duration: 0, x: safeX, y: Math.round(height * 0.25) },
              { type: 'pointerDown', button: 0 },
              { type: 'pointerMove', duration: 600, origin: 'viewport', x: safeX, y: Math.round(height * 0.9) },
              { type: 'pointerUp', button: 0 },
            ],
          },
        ]);
        await this.driver.pause(200);
      }
      await this.nudgeToRevealFirstItem();
    }
    await this.driver.pause(500); 
  }

  /**
   * Performs a single, large flick to reveal the Name/Price of the first row.
   * Only active on Tablets/Pads where the cards are too tall for the viewport.
   */
  async nudgeToRevealFirstItem() {
    const { width, height } = await this.driver.getWindowRect();
    if (width > 1200) {
      const safeX = Math.round(width * 0.3);
      // Calibrated 60% tug (Pulls labels from bottom row into clear view)
      await this.swipe(safeX, Math.round(height * 0.8), safeX, Math.round(height * 0.2), 800);
      await this.driver.pause(800);
    }
  }

  /**
   * Get attributes of the first visual product in the grid.
   */
  async getFirstProductDetails() {
    const selector = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.ImageView").clickable(true).instance(0)' 
      : '~product-item';
    
    const firstProduct = await this.driver.$(selector);
    await firstProduct.waitForDisplayed({ timeout: 5000 });
    return await firstProduct.getAttribute('content-desc');
  }

  /**
   * Perform a data-driven integrity audit of a specific category.
   * Matches exactly against the provided product list (Names and Prices).
   * @param {Object} categoryData - From products.js
   */
  async verifyCategoryIntegrity(categoryData) {
    let collectedNames = new Set();
    let scrollCount = 0;
    const maxFlicks = 10;
    const totalGoal = categoryData.count;

    const { width, height } = await this.driver.getWindowRect();
    const isTablet = width > 1200;
    const safeX = Math.round(width * 0.3);

    while (collectedNames.size < totalGoal && scrollCount < maxFlicks) {
      const items = await this.driver.$$('android=new UiSelector().className("android.widget.ImageView").clickable(true)');
      
      for (const item of items) {
        const desc = await item.getAttribute('content-desc');
        if (desc && desc.includes('$')) {
          const [name, price] = desc.split('\n');
          
          const expectedProduct = categoryData.products.find(p => p.name === name);
          if (expectedProduct) {
            if (expectedProduct.price !== price) {
              throw new Error(`Data Mismatch: Product "${name}" expected price ${expectedProduct.price}, got ${price}`);
            }
            collectedNames.add(name);
          }
        }
      }

      if (collectedNames.size >= totalGoal) break;

      // Safe Middle-Slice Flick
      await this.swipe(safeX, Math.round(height * 0.75), safeX, Math.round(height * 0.25), 1000);
      scrollCount++;
      await this.driver.pause(1000);
    }

    // FINAL ANCHOR TUG: Force the absolute bottom edge into view
    // Tablets need two tugs to clear their tall cards; Mobile only needs one.
    const settleCount = isTablet ? 2 : 1;
    
    for (let i = 0; i < settleCount; i++) {
      await this.driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: safeX, y: Math.round(height * 0.8) },
            { type: 'pointerDown', button: 0 },
            { type: 'pointerMove', duration: 10, x: safeX, y: Math.round(height * 0.8) - 20 },
            { type: 'pointerMove', duration: 1000, origin: 'viewport', x: safeX, y: Math.round(height * 0.15) },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ]);
      await this.driver.pause(1000);
    }

    // Final audit pass at the bottom
    const finalItems = await this.driver.$$('android=new UiSelector().className("android.widget.ImageView").clickable(true)');
    for (const item of finalItems) {
      const desc = await item.getAttribute('content-desc');
      if (desc && desc.includes('$')) {
        const name = desc.split('\n')[0];
        if (categoryData.products.some(p => p.name === name)) {
          collectedNames.add(name);
        }
      }
    }

    return collectedNames.size === totalGoal;
  }

  /**
   * Perform a high-speed 'Flick & Verify' check of the entire catalog.
   * Optimized for both local speed and CI stability.
   */
  async verifyFullCatalogIntegrity() {
    let collectedItems = new Set();
    let scrollCount = 0;
    const maxFlicks = 35; 
    const totalGoal = 32;

    const { width, height } = await this.driver.getWindowRect();
    const isTablet = width > 1200;
    const safeX = Math.round(width * 0.3);
    const swipeDepth = isTablet ? 0.7 : 0.45; 

    while (scrollCount < maxFlicks) {
      const items = await this.driver.$$('android=new UiSelector().className("android.widget.ImageView").clickable(true)');
      for (const item of items) {
        const desc = await item.getAttribute('content-desc');
        if (desc && desc.includes('$')) {
          collectedItems.add(desc.split('\n')[0]);
        }
      }

      const metaText = await (await this.driver.$(this.resultCount)).getAttribute('content-desc');
      if (metaText.includes(`${totalGoal} of ${totalGoal}`)) break; 

      await this.driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: safeX, y: Math.round(height * 0.8) },
            { type: 'pointerDown', button: 0 },
            { type: 'pointerMove', duration: 10, x: safeX, y: Math.round(height * 0.8) - 20 },
            { type: 'pointerMove', duration: 1000, origin: 'viewport', x: safeX, y: Math.round(height * (0.8 - swipeDepth)) },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ]);
      scrollCount++;
      await this.driver.pause(isTablet ? 1500 : 1200); 
    }

    const settleCount = isTablet ? 2 : 1;
    for (let i = 0; i < settleCount; i++) {
      await this.driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: safeX, y: Math.round(height * 0.8) },
            { type: 'pointerDown', button: 0 },
            { type: 'pointerMove', duration: 1000, origin: 'viewport', x: safeX, y: Math.round(height * 0.15) },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ]);
      await this.driver.pause(1200);
    }

    const finalItems = await this.driver.$$('android=new UiSelector().className("android.widget.ImageView").clickable(true)');
    for (const item of finalItems) {
      const desc = await item.getAttribute('content-desc');
      if (desc && desc.includes('$')) {
        collectedItems.add(desc.split('\n')[0]);
      }
    }
    return collectedItems.size >= totalGoal;
  }
}

module.exports = { ProductGridPage };
