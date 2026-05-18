// @ts-check
const { BasePage } = require('./BasePage');

/**
 * CartPage — POM for the Shopping Cart screen.
 *
 * Line item structure (verified from test-results/cart_dump.xml, 2026-05-18):
 *   ImageView with content-desc = "<Product>\n$<line total>\n<qty>".
 *   Within each line: 3 Button children, left-to-right [Minus, Plus, Delete].
 *   Minus is enabled=false, clickable=false at qty=1.
 *   Plus/Delete are NAF (no content-desc) — positional only.
 *
 * Color-variant lines from §12 PD02 share IDENTICAL content-desc. Per-line
 * buttons therefore can't be addressed via UiSelector childSelector alone
 * (instance disambiguation gets tangled with disabled-Minus indexing). We
 * resolve via the line ImageView's bounds: each button sits at fixed
 * relative offsets within the line (29% / 52% / 89% across, 67% down).
 * Bounds are read from the live element — no hardcoded screen coords.
 *
 * The cart body is wrapped in an android.widget.ScrollView. Compose
 * virtualises off-screen rows, so on a phone-height viewport only ~6 of 7
 * lines are in the a11y tree at scroll-top. `collectAllLines()` swipes the
 * ScrollView and stitches snapshots so Σ(line.total) can be verified
 * against the bottom-bar cart Total.
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

    // Line items: ImageView with content-desc containing `$` (the total label
    // is a View, not an ImageView, so this isolates lines cleanly).
    this.lineItem = this.isAndroid
      ? 'android=new UiSelector().className("android.widget.ImageView").descriptionContains("$")'
      : '~cart-line-item';

    // Bottom bar
    this.totalLabel = this.isAndroid
      ? 'android=new UiSelector().description("Total:")'
      : '~Total:';

    // Total value: View with content-desc like "$914.93". Line totals live
    // inside ImageView nodes, so className=View + descriptionStartsWith("$")
    // resolves uniquely. (descriptionMatches with regex anchors flaked under
    // the UiSelector → Java regex bridge — startsWith avoids the escape
    // hazard entirely.)
    this.totalValue = this.isAndroid
      ? 'android=new UiSelector().className("android.view.View").descriptionStartsWith("$")'
      : '~cart-total-value';

    this.proceedToCheckoutBtn = this.isAndroid
      ? 'android=new UiSelector().className("android.widget.Button").description("Proceed to Checkout")'
      : '~Proceed to Checkout';

    // ScrollView bounds — phone Pixel 8: [0,279][1080,2085]. Used as a
    // safety window for swipe coordinates so we don't accidentally swipe
    // the status bar or bottom bar.
    this._cartScroll = this.isAndroid
      ? 'android=new UiSelector().className("android.widget.ScrollView").scrollable(true)'
      : '~cart-scroll';
  }

  async waitForPageLoad() {
    await this.waitForDisplayed(this.cartTitle);
  }

  async clickContinueShopping() {
    const btn = await this.driver.$(this.continueShoppingBtn);
    await btn.click();
  }

  // ─── Line readers ────────────────────────────────────────────────

  /** Count of line items currently in the a11y tree (visible only). */
  async getLineCount() {
    const lines = await this.driver.$$(this.lineItem);
    return lines.length;
  }

  _parseDesc(desc) {
    const parts = (desc || '').split('\n');
    if (parts.length < 3) {
      throw new Error(`malformed line desc "${desc}"`);
    }
    const total = parseFloat(parts[1].replace(/[^0-9.]/g, ''));
    const qty = parseInt(parts[2], 10);
    return { name: parts[0], totalText: parts[1], total, qty, raw: desc };
  }

  _parseBounds(bounds) {
    // Format: "[x1,y1][x2,y2]"
    const m = (bounds || '').match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
    if (!m) throw new Error(`malformed bounds "${bounds}"`);
    return {
      x1: parseInt(m[1], 10),
      y1: parseInt(m[2], 10),
      x2: parseInt(m[3], 10),
      y2: parseInt(m[4], 10),
    };
  }

  async getLine(index) {
    const lines = await this.driver.$$(this.lineItem);
    if (index >= lines.length) {
      throw new Error(`getLine(${index}) — only ${lines.length} lines present`);
    }
    const desc = await lines[index].getAttribute(this.attrName);
    return this._parseDesc(desc);
  }

  /** Visible lines only (no scroll). */
  async getAllLines() {
    const lines = await this.driver.$$(this.lineItem);
    const out = [];
    for (const el of lines) {
      const desc = await el.getAttribute(this.attrName);
      out.push(this._parseDesc(desc));
    }
    return out;
  }

  // ─── Scroll + collect ────────────────────────────────────────────

  async _readVisibleSnapshot() {
    const lines = await this.driver.$$(this.lineItem);
    const out = [];
    for (const el of lines) {
      const desc = await el.getAttribute(this.attrName);
      out.push(this._parseDesc(desc));
    }
    return out;
  }

  async _swipeCart(fromY, toY) {
    const { width } = await this.driver.getWindowRect();

    // Tablet branch (width > 1200): derive Y from the live ScrollView
    // bounds. Hardcoded phone Y (1800↔800) sits outside tablet's taller
    // viewport and the swipe is a no-op there. Phone path is unchanged.
    // If the cart fits in one viewport (no scrollable container), tablet
    // doesn't need any swipe — silently no-op.
    if (width > 1200) {
      const sv = await this.driver.$(this._cartScroll);
      if (!(await sv.isExisting())) return;
      const b = this._parseBounds(await sv.getAttribute('bounds'));
      const span = b.y2 - b.y1;
      const tabletTop = b.y1 + Math.round(span * 0.20);
      const tabletBottom = b.y1 + Math.round(span * 0.80);
      // Preserve caller intent: fromY > toY ⇒ "scroll down" (reveal more).
      const tabletFrom = fromY > toY ? tabletBottom : tabletTop;
      const tabletTo   = fromY > toY ? tabletTop    : tabletBottom;
      const centerX = Math.round((b.x1 + b.x2) / 2);
      await this.swipe(centerX, tabletFrom, centerX, tabletTo, 500);
      await this.driver.pause(this.settlePause);
      return;
    }

    const centerX = Math.round(width / 2);
    await this.swipe(centerX, fromY, centerX, toY, 500);
    await this.driver.pause(this.settlePause);
  }

  async _scrollCartToTop() {
    // No-op if nothing's scrollable (cart fits in viewport — typical on
    // tablet portrait with 7 lines).
    const sv = await this.driver.$(this._cartScroll);
    if (!(await sv.isExisting())) return;
    // Single fluid fling — no stacked-bounce visual on entry/exit.
    try {
      await this.driver.$('android=new UiScrollable(new UiSelector().scrollable(true).className("android.widget.ScrollView")).flingToBeginning(10)');
    } catch {
      // Fallback if no scroll occurred (already at top): UiScrollable throws.
    }
    await this.driver.pause(this.settlePause);
  }

  /**
   * Stitch two ordered snapshots into a single contiguous list.
   * Finds the longest k where A's last-k descs equal B's first-k descs,
   * then appends the unique tail of B. Safe with duplicate variant lines
   * because the overlap is matched in-order, not as a set.
   */
  _stitch(A, B) {
    let k = Math.min(A.length, B.length);
    while (k > 0) {
      let match = true;
      for (let i = 0; i < k; i++) {
        if (A[A.length - k + i].raw !== B[i].raw) { match = false; break; }
      }
      if (match) break;
      k--;
    }
    return [...A, ...B.slice(k)];
  }

  /**
   * Walk the cart ScrollView from top to bottom, stitching snapshots into
   * one contiguous list. Assumes entry position is at top (typical when
   * the cart was just opened — no leading scroll-to-top needed).
   */
  async collectAllLines() {
    let collected = await this._readVisibleSnapshot();

    // Walk down in half-viewport steps until the snapshot stops growing.
    // Cap at 4 passes — even a long cart fits in 4 viewport-halves.
    for (let pass = 0; pass < 4; pass++) {
      const before = collected.length;
      await this._swipeCart(1800, 800);
      const snap = await this._readVisibleSnapshot();
      collected = this._stitch(collected, snap);
      if (collected.length === before) break;
    }
    // Single fluid fling back to top so subsequent S* tests operate on
    // line 0 from a known viewport position.
    await this._scrollCartToTop();
    return collected;
  }

  /** Cart Total numeric value from the bottom bar. */
  async getCartTotal() {
    const el = await this.driver.$(this.totalValue);
    const desc = await el.getAttribute(this.attrName);
    return parseFloat((desc || '').replace(/[^0-9.]/g, ''));
  }

  // ─── Per-line buttons via direct child click ──────────────────────
  // Each line ImageView has 3 NAF Button children in DOM order
  // [Minus, Plus, Delete]. Direct .click() on the child element works
  // regardless of layout (phone portrait, tablet portrait, etc.) and
  // sidesteps the per-device coordinate-offset problem.

  async _lineButtons(index) {
    const lines = await this.driver.$$(this.lineItem);
    if (index >= lines.length) {
      throw new Error(`line button: only ${lines.length} lines, requested ${index}`);
    }
    const buttons = await lines[index].$$('android.widget.Button');
    if (buttons.length < 3) {
      throw new Error(`line ${index} has ${buttons.length} buttons, expected 3`);
    }
    return { minus: buttons[0], plus: buttons[1], delete: buttons[2] };
  }

  async tapPlus(index) {
    const { plus } = await this._lineButtons(index);
    await plus.click();
    await this.driver.pause(this.settlePause);
  }

  async tapMinus(index) {
    const { minus } = await this._lineButtons(index);
    await minus.click();
    await this.driver.pause(this.settlePause);
  }

  async tapDelete(index) {
    const { delete: del } = await this._lineButtons(index);
    await del.click();
    await this.driver.pause(this.settlePause);
  }

  /**
   * Read clickable/enabled flags on the Minus button at `index`. Locates
   * it as the first Button child of the line ImageView's bounds via a
   * narrow point-elements query — bounds-derived, no hardcoded coords.
   */
  async getMinusState(index) {
    const lines = await this.driver.$$(this.lineItem);
    if (index >= lines.length) throw new Error(`minus state: bad index ${index}`);
    // First Button descendant within the line subtree (DOM order ⇒ Minus).
    const minusBtn = await lines[index].$('android.widget.Button');
    const clickable = await minusBtn.getAttribute('clickable');
    const enabled = await minusBtn.getAttribute('enabled');
    return { clickable: clickable === 'true', enabled: enabled === 'true' };
  }

  async tapProceedToCheckout() {
    const btn = await this.driver.$(this.proceedToCheckoutBtn);
    await btn.click();
  }
}

module.exports = { CartPage };
