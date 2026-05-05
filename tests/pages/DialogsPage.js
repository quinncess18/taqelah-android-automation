// @ts-check
const { BasePage } = require('./BasePage');

/**
 * DialogsPage — POM for the Dialogs & Alerts module.
 * Covers: Alert Dialog, Bottom Sheet, Snackbar, Date Picker,
 * Time Picker, Simple Dialog (Radio Options), Full-Screen Dialog.
 */
class DialogsPage extends BasePage {
  /**
   * @param {import('webdriverio').Browser} driver
   */
  constructor(driver) {
    super(driver);

    // ── Page Title ──
    this.title = this.isAndroid
      ? 'android=new UiSelector().description("Dialogs & Alerts")'
      : '~Dialogs & Alerts';

    // ── Header Back Button ──
    this.backBtn = this.isAndroid
      ? 'android=new UiSelector().description("Back")'
      : '~Back';

    // ── Result Card (shows last action / default state) ──
    this.resultCard = this.isAndroid
      ? 'android=new UiSelector().description("Interact with a dialog to see the result here")'
      : '~result-card';

    // ── Dialog Trigger Buttons ──
    this.alertBtn = this.isAndroid
      ? 'android=new UiSelector().description("Alert Dialog")'
      : '~Alert Dialog';

    this.bottomSheetBtn = this.isAndroid
      ? 'android=new UiSelector().description("Bottom Sheet")'
      : '~Bottom Sheet';

    this.snackbarBtn = this.isAndroid
      ? 'android=new UiSelector().description("Snackbar")'
      : '~Snackbar';

    this.datePickerBtn = this.isAndroid
      ? 'android=new UiSelector().description("Date Picker")'
      : '~Date Picker';

    this.timePickerBtn = this.isAndroid
      ? 'android=new UiSelector().description("Time Picker")'
      : '~Time Picker';

    this.simpleDialogBtn = this.isAndroid
      ? 'android=new UiSelector().description("Simple Dialog (Radio Options)")'
      : '~Simple Dialog (Radio Options)';

    this.fullScreenBtn = this.isAndroid
      ? 'android=new UiSelector().description("Full-Screen Dialog")'
      : '~Full-Screen Dialog';

    // ── Alert Dialog ──
    this.alertTitle = this.isAndroid
      ? 'android=new UiSelector().description("Alert Dialog")'
      : '~Alert Dialog';

    this.alertMessage = this.isAndroid
      ? 'android=new UiSelector().description("This is a sample alert dialog. Choose an action.")'
      : '~alert-message';

    this.alertCancel = this.isAndroid
      ? 'android=new UiSelector().description("Cancel")'
      : '~Cancel';

    this.alertOk = this.isAndroid
      ? 'android=new UiSelector().description("OK")'
      : '~OK';

    // ── Bottom Sheet ──
    this.bottomSheetTitle = this.isAndroid
      ? 'android=new UiSelector().description("Bottom Sheet")'
      : '~Bottom Sheet';

    this.bottomSheetDesc = this.isAndroid
      ? 'android=new UiSelector().description("This is a modal bottom sheet with some content.")'
      : '~bottom-sheet-desc';

    this.bottomSheetClose = this.isAndroid
      ? 'android=new UiSelector().description("Close")'
      : '~Close';

    this.bottomSheetScrim = this.isAndroid
      ? 'android=new UiSelector().description("Scrim")'
      : '~Scrim';

    // ── Snackbar ──
    this.snackbarMessage = this.isAndroid
      ? 'android=new UiSelector().description("This is a snackbar message")'
      : '~snackbar-message';

    this.snackbarUndo = this.isAndroid
      ? 'android=new UiSelector().description("UNDO")'
      : '~UNDO';

    this.snackbarUndoToast = this.isAndroid
      ? 'android=new UiSelector().description("Undo action performed!")'
      : '~undo-toast';

    // ── Date Picker ──
    this.datePickerTitle = this.isAndroid
      ? 'android=new UiSelector().descriptionContains("Select date")'
      : '~date-picker-title';

    this.datePickerYear = this.isAndroid
      ? 'android=new UiSelector().descriptionContains("Select year")'
      : '~date-picker-year';

    this.datePickerPrevMonth = this.isAndroid
      ? 'android=new UiSelector().description("Previous month")'
      : '~Previous month';

    this.datePickerNextMonth = this.isAndroid
      ? 'android=new UiSelector().description("Next month")'
      : '~Next month';

    this.datePickerSwitchInput = this.isAndroid
      ? 'android=new UiSelector().description("Switch to input")'
      : '~Switch to input';

    this.datePickerSwitchCalendar = this.isAndroid
      ? 'android=new UiSelector().description("Switch to calendar")'
      : '~Switch to calendar';

    this.datePickerInputField = this.isAndroid
      ? 'android=new UiSelector().className("android.widget.EditText")'
      : '~date-input';

    this.datePickerInvalidFormat = this.isAndroid
      ? 'android=new UiSelector().description("Invalid format.")'
      : '~Invalid format.';

    this.datePickerCancel = this.isAndroid
      ? 'android=new UiSelector().description("Cancel")'
      : '~Cancel';

    this.datePickerOk = this.isAndroid
      ? 'android=new UiSelector().description("OK")'
      : '~OK';

    // ── Time Picker ──
    this.timePickerTitle = this.isAndroid
      ? 'android=new UiSelector().descriptionContains("Select time")'
      : '~time-picker-title';

    this.timePickerHours = this.isAndroid
      ? 'android=new UiSelector().descriptionContains("Select hours")'
      : '~time-picker-hours';

    this.timePickerMinutes = this.isAndroid
      ? 'android=new UiSelector().descriptionContains("Select minutes")'
      : '~time-picker-minutes';

    this.timePickerAm = this.isAndroid
      ? 'android=new UiSelector().description("AM")'
      : '~AM';

    this.timePickerPm = this.isAndroid
      ? 'android=new UiSelector().description("PM")'
      : '~PM';

    this.timePickerSwitchInput = this.isAndroid
      ? 'android=new UiSelector().description("Switch to text input mode")'
      : '~Switch to text input mode';

    this.timePickerSwitchDial = this.isAndroid
      ? 'android=new UiSelector().description("Switch to dial picker mode")'
      : '~Switch to dial picker mode';

    this.timePickerInputTitle = this.isAndroid
      ? 'android=new UiSelector().description("Enter time")'
      : '~Enter time';

    this.timePickerHourInput = this.isAndroid
      ? 'android=new UiSelector().className("android.widget.EditText").instance(0)'
      : '~hour-input';

    this.timePickerMinuteInput = this.isAndroid
      ? 'android=new UiSelector().className("android.widget.EditText").instance(1)'
      : '~minute-input';

    this.timePickerCancel = this.isAndroid
      ? 'android=new UiSelector().description("Cancel")'
      : '~Cancel';

    this.timePickerOk = this.isAndroid
      ? 'android=new UiSelector().description("OK")'
      : '~OK';

    // ── Simple Dialog (Radio Options) ──
    this.simpleDialogTitle = this.isAndroid
      ? 'android=new UiSelector().description("Choose an option")'
      : '~Choose an option';

    this.simpleDialogOptionRed = this.isAndroid
      ? 'android=new UiSelector().description("Red")'
      : '~Red';

    this.simpleDialogOptionBlue = this.isAndroid
      ? 'android=new UiSelector().description("Blue")'
      : '~Blue';

    this.simpleDialogOptionGreen = this.isAndroid
      ? 'android=new UiSelector().description("Green")'
      : '~Green';

    // ── Full-Screen Dialog ──
    this.fullScreenTitle = this.isAndroid
      ? 'android=new UiSelector().description("Full Screen Dialog")'
      : '~Full Screen Dialog';

    this.fullScreenDesc = this.isAndroid
      ? 'android=new UiSelector().description("This is a full-screen dialog")'
      : '~full-screen-desc';

    this.fullScreenBackBtn = this.isAndroid
      ? 'android=new UiSelector().className("android.widget.Button").instance(0)'
      : '~Back';

    // ── Shared Dismiss Overlay ──
    this.dismissOverlay = this.isAndroid
      ? 'android=new UiSelector().description("Dismiss")'
      : '~Dismiss';
  }

  /**
   * Wait for the Dialogs page to load.
   */
  async waitForPageLoad() {
    await this.waitForDisplayed(this.title);
  }

  /**
   * Get the result text after a dialog action.
   * Reads the content-desc from the result card (e.g. "Alert: OK pressed",
   * "Bottom Sheet: Closed", "Snackbar: Undone").
   * @returns {Promise<string>}
   */
  async getResultText() {
    // Try post-action result first (contains a colon like "Alert: Cancelled",
    // "Bottom Sheet: Closed", "Snackbar: Undone", "Selected: ...")
    const postActionEl = await this.driver.$(
      this.isAndroid
        ? 'android=new UiSelector().descriptionContains(":")'
        : '~result-card'
    );
    if (await postActionEl.isExisting()) {
      return await postActionEl.getAttribute('content-desc');
    }
    // Fall back to default state or Simple Dialog result (no colon)
    const el = await this.driver.$(this.resultCard);
    return await el.getAttribute('content-desc');
  }

  /**
   * Type a value into a numeric/constrained EditText field. The picker's
   * narrow input fields (hour/minute, date) drop keys when typed via raw
   * setValue because their input filters race with WebdriverIO's internal
   * focus dance. Explicit click for focus + addValue (no internal re-focus)
   * is the reliable path.
   * @param {string} selector
   * @param {string} value
   */
  async typeIntoEditText(selector, value) {
    const el = await this.driver.$(selector);
    await el.click();
    await this.driver.pause(200);
    await el.clearValue();
    await this.driver.pause(200);
    await el.addValue(value);
    await this.driver.pause(200);
  }

  /**
   * Dismiss any open dialog by clicking the Dismiss overlay.
   */
  async dismissDialog() {
    const dismiss = await this.driver.$(this.dismissOverlay);
    if (await dismiss.isExisting()) {
      await dismiss.click();
      await this.driver.pause(800);
    }
  }

  /**
   * Dismiss a Bottom Sheet by clicking the Scrim.
   */
  async dismissBottomSheet() {
    const scrim = await this.driver.$(this.bottomSheetScrim);
    if (await scrim.isExisting()) {
      await scrim.click();
      await this.driver.pause(800);
    }
  }

  /**
   * Select a year from the Date Picker year dropdown.
   * @param {number} year
   */
  async selectYear(year) {
    const selector = this.isAndroid
      ? `android=new UiSelector().description("${year}")`
      : `~${year}`;
    const el = await this.driver.$(selector);
    await el.click();
    await this.driver.pause(500);
  }

  /**
   * Select a date from the Date Picker by its day number.
   * @param {number} day
   */
  async selectDate(day) {
    const selector = this.isAndroid
      ? `android=new UiSelector().descriptionContains("${day}, ")`
      : `~${day}`;
    const el = await this.driver.$(selector);
    await el.click();
    await this.driver.pause(500);
  }

  /**
   * Compute the analog dial canvas geometry from selector-anchored bounds.
   * The dial itself has no accessibility children (it's a custom Compose
   * canvas), so we derive its bounds from sibling anchors.
   *
   * Phone (portrait): header sits at top, dial canvas spans the area
   * between header.bottom and switchBtn.top.
   *
   * Tablet (landscape): the dialog is laid out side-by-side. The header
   * occupies the LEFT half (vertically), and the dial canvas occupies
   * the RIGHT half (between header.right and the OK button's right edge,
   * vertically aligned with the header). Detected by switch-button being
   * at roughly the same y as header.bottom (no vertical room below).
   *
   * @returns {Promise<{cx: number, cy: number, radius: number}>}
   */
  async _dialGeometry() {
    const header = await this.driver.$(
      this.isAndroid
        ? 'android=new UiSelector().descriptionContains("Select time")'
        : '~Select time'
    );
    const switchBtn = await this.driver.$(this.timePickerSwitchInput);
    const hLoc = await header.getLocation();
    const hSize = await header.getSize();
    const sLoc = await switchBtn.getLocation();

    const headerBottom = hLoc.y + hSize.height;
    const verticalRoomBelowHeader = sLoc.y - headerBottom;
    const isTabletLayout = verticalRoomBelowHeader < 200;

    if (isTabletLayout) {
      // Right-of-header layout. The dial circle is not centered between
      // header.right and dialog.right — it sits ~80% across the dialog
      // width. Empirically, the Cancel button's horizontal center
      // matches the dial center (within tap tolerance), so we anchor
      // on it. Vertical center is the header's midpoint.
      const cancelBtn = await this.driver.$(this.timePickerCancel);
      const cLoc = await cancelBtn.getLocation();
      const cSize = await cancelBtn.getSize();
      const cx = Math.round(cLoc.x + cSize.width / 2);
      const cy = Math.round(hLoc.y + hSize.height / 2);
      const radius = Math.round(
        Math.min(hSize.width, hSize.height) / 2 - 16
      );
      return { cx, cy, radius };
    }

    // Phone (below-header) layout
    const cx = Math.round(hLoc.x + hSize.width / 2);
    const canvasTop = headerBottom;
    const canvasBottom = sLoc.y;
    const cy = Math.round((canvasTop + canvasBottom) / 2);
    const radius = Math.round(
      Math.min(hSize.width / 2, (canvasBottom - canvasTop) / 2) - 60
    );
    return { cx, cy, radius };
  }

  /**
   * Tap the analog dial canvas at a clock angle (0° = 12 o'clock, clockwise).
   * @param {number} angleDegFromTop
   */
  async _tapDialAt(angleDegFromTop) {
    const { cx, cy, radius } = await this._dialGeometry();
    const theta = (angleDegFromTop - 90) * Math.PI / 180;
    const x = Math.round(cx + radius * Math.cos(theta));
    const y = Math.round(cy + radius * Math.sin(theta));
    await this.driver.performActions([{
      type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x, y },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 80 },
        { type: 'pointerUp', button: 0 },
      ],
    }]);
    await this.driver.pause(this.settlePause);
  }

  /**
   * Set the Time Picker hours via dial tap. Forces focus to the hours
   * dial first (clicking the hours SeekBar), then taps the hour position.
   * @param {number} hour - Hour value (1-12)
   */
  async setHours(hour) {
    const sb = await this.driver.$(this.timePickerHours);
    await sb.click();
    await this.driver.pause(300);
    await this._tapDialAt(hour * 30);
  }

  /**
   * Set the Time Picker minutes via dial tap. Forces focus to the minutes
   * dial first (clicking the minutes SeekBar), then taps the minute position.
   * @param {number} minute - Minute value (0-59)
   */
  async setMinutes(minute) {
    const sb = await this.driver.$(this.timePickerMinutes);
    await sb.click();
    await this.driver.pause(300);
    await this._tapDialAt(minute * 6);
  }

  /**
   * Select AM or PM in the Time Picker.
   * @param {'AM' | 'PM'} period
   */
  async selectPeriod(period) {
    const selector = period === 'AM' ? this.timePickerAm : this.timePickerPm;
    const el = await this.driver.$(selector);
    await el.click();
    await this.driver.pause(500);
  }

  /**
   * Select a radio option in the Simple Dialog.
   * @param {'Red' | 'Blue' | 'Green'} option
   */
  async selectSimpleOption(option) {
    const selector = this.isAndroid
      ? `android=new UiSelector().description("${option}")`
      : `~${option}`;
    const el = await this.driver.$(selector);
    await el.click();
    await this.driver.pause(500);
  }

  /**
   * Go back from the Full-Screen Dialog using the header back button.
   */
  async goBackFromFullScreen() {
    const el = await this.driver.$(this.fullScreenBackBtn);
    await el.click();
    await this.driver.pause(800);
  }
}

module.exports = { DialogsPage };
