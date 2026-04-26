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
    this.gridTitle = this.isAndroid 
      ? 'android=new UiSelector().description("All Dresses")' 
      : '~All Dresses';
    
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
   * Note: Does not perform a scroll reset. Use resetToTop() if verification is needed at the top.
   * @param {'AZ' | 'ZA' | 'LowHigh' | 'HighLow'} type 
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
   * Universal Reset to Top.
   * Intelligently snaps the grid to the absolute top based on device type.
   * @param {number} [count] Optional override for number of swipes.
   */
  async resetToTop(count) {
    const { width, height } = await this.driver.getWindowRect();
    const isTablet = width > 1200;
    const safeX = Math.round(width * 0.3);

    // Use provided count or device-specific defaults (Mobile: 2, Tablet: 4)
    const resetCount = count || (isTablet ? 4 : 2);

    if (!isTablet) {
      // MOBILE: Short middle-zone flicks
      for (let i = 0; i < resetCount; i++) {
        await this.driver.performActions([
          {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', duration: 0, x: safeX, y: Math.round(height * 0.45) },
              { type: 'pointerDown', button: 0 },
              { type: 'pointerMove', duration: 600, origin: 'viewport', x: safeX, y: Math.round(height * 0.65) },
              { type: 'pointerUp', button: 0 },
            ],
          },
        ]);
        await this.driver.pause(400);
      }
    } else {
      // TABLET: Four sequential Wide-Throw Power Swipes (Doubled)
      for (let i = 0; i < 4; i++) {
        await this.driver.performActions([
          {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', duration: 0, x: safeX, y: Math.round(height * 0.25) },
              { type: 'pointerDown', button: 0 },
              { type: 'pointerMove', duration: 1200, origin: 'viewport', x: safeX, y: Math.round(height * 0.9) },
              { type: 'pointerUp', button: 0 },
            ],
          },
        ]);
        await this.driver.pause(600);
      }

      // DETAIL NUDGE: Pull the page UP slightly to reveal the Name/Price of the first tall card
      await this.driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: safeX, y: Math.round(height * 0.7) },
            { type: 'pointerDown', button: 0 },
            { type: 'pointerMove', duration: 1000, origin: 'viewport', x: safeX, y: Math.round(height * 0.5) },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ]);
    }
    await this.driver.pause(1000); 
    }

  /**
   * Get attributes of the first visual product in the grid.
   * Targets the first clickable ImageView to ensure stability across columns.
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
   * Search for a specific term
   */
  async searchForItem(term) {
    const search = await this.driver.$(this.searchInput);
    await search.click();
    await search.addValue(term);
    await this.driver.pause(1000); 
    if (await this.driver.isKeyboardShown()) await this.driver.hideKeyboard();
  }

  async getVisibleProductCount() {
    const selector = this.isAndroid 
      ? 'android=new UiSelector().className("android.widget.ImageView").clickable(true)' 
      : '~product-item';
    const items = await this.driver.$$(selector);
    return items.length;
  }

  /**
   * Perform a high-speed 'Flick & Verify' check of the entire catalog.
   * Confirms every card contains an Image, Name, and Price.
   * Cart button check is handled adaptively (some tablet layouts hide it).
   */
  async verifyFullCatalogIntegrity() {
    let collectedItems = new Set();
    let scrollCount = 0;
    const maxFlicks = 30; // Increased to ensure Tablet reaches the bottom
    const totalGoal = 32;

    const { width, height } = await this.driver.getWindowRect();
    const isTablet = width > 1200;
    const safeX = Math.round(width * 0.3);
    
    // DEVICE-SPECIFIC GESTURE MAP
    const swipeDepth = isTablet ? 0.75 : 0.55; 

    while (collectedItems.size < totalGoal && scrollCount < maxFlicks) {
      // 1. Capture current visible items FIRST
      const items = await this.driver.$$('android=new UiSelector().className("android.widget.ImageView").clickable(true)');
      
      for (const item of items) {
        const desc = await item.getAttribute('content-desc');
        if (desc && desc.includes('$')) {
          const productName = desc.split('\n')[0];
          
          if (!isTablet) {
            const hasCartBtn = await item.$('android=new UiSelector().className("android.widget.Button")').isExisting();
            if (hasCartBtn) collectedItems.add(productName);
          } else {
            collectedItems.add(productName);
          }
        }
      }

      // 2. METADATA CHECK (After Scan): Break only if we are truly at the end
      const metaText = await (await this.driver.$(this.resultCount)).getAttribute('content-desc');
      if (metaText.includes(`${totalGoal} of ${totalGoal}`)) {
        break; 
      }

      // 3. Perform Adaptive Swipe
      const startY = Math.round(height * 0.8); 
      const endY = Math.round(height * (0.8 - swipeDepth));

      await this.driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: safeX, y: startY },
            { type: 'pointerDown', button: 0 },
            { type: 'pointerMove', duration: 10, x: safeX, y: startY - 20 },
            { type: 'pointerMove', duration: 1000, origin: 'viewport', x: safeX, y: endY },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ]);
      
      scrollCount++;
      await this.driver.pause(isTablet ? 1200 : 800); 
    }

    // FINAL SETTLE: Force the absolute bottom edge into view
    // Tablets need two swipes to clear their tall cards; Mobile only needs one.
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

    // FINAL AUDIT: Capture the items revealed by the settle swipes
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
