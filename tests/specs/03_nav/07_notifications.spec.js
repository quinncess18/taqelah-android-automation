// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
const { NavMenuPage } = require('../../pages/NavMenuPage');
const { NotificationsPage } = require('../../pages/NotificationsPage');

test.describe('Navigation - Notifications Suite', () => {
  /**
   * Shared setup: pm clear app data, relaunch, re-login (pm clear wipes auth),
   * open the nav drawer, and navigate to the Notifications page. The native
   * OS dialog will be on-screen when this resolves.
   */
  async function gotoNotifications(driver) {
    const loginPage = new LoginPage(driver);
    const landingPage = new CatalogLandingPage(driver);
    const navMenu = new NavMenuPage(driver);
    const notificationsPage = new NotificationsPage(driver);

    await notificationsPage.resetNotificationPermission();

    // pm clear wipes login state — re-authenticate using the standard
    // LoginPage.login() (same path the auth/catalog specs use on tablet).
    await loginPage.waitForDisplayed(loginPage.loginButton, 10000);
    await loginPage.login(loginPage.defaultUser, loginPage.defaultPass);
    await landingPage.waitForDisplayed(landingPage.shopAllBtn, 10000);

    await navMenu.open();
    await navMenu.navigateTo(navMenu.navNotifications);

    return notificationsPage;
  }

  /**
   * Shared page-shell assertions (header, description, section headers, all 5
   * trigger buttons). The card-status selector differs per TC, so it is
   * passed in.
   */
  async function assertPageShell(notificationsPage, cardStatusSelector, cardLabel) {
    expect(await notificationsPage.isVisible(notificationsPage.title)).toBe(true);
    expect(await notificationsPage.isVisible(notificationsPage.backBtn)).toBe(true);
    expect(await notificationsPage.isVisible(notificationsPage.description)).toBe(true);
    expect(await notificationsPage.isVisible(cardStatusSelector)).toBe(true);

    expect(await notificationsPage.isVisible(notificationsPage.systemNotificationsHeader)).toBe(true);
    expect(await notificationsPage.isVisible(notificationsPage.inAppNotificationsHeader)).toBe(true);

    expect(await notificationsPage.isVisible(notificationsPage.sendInstantBtn)).toBe(true);
    expect(await notificationsPage.isVisible(notificationsPage.scheduleNotificationBtn)).toBe(true);
    expect(await notificationsPage.isVisible(notificationsPage.showBannerBtn)).toBe(true);
    expect(await notificationsPage.isVisible(notificationsPage.showDialogBtn)).toBe(true);
    expect(await notificationsPage.isVisible(notificationsPage.showSnackbarBtn)).toBe(true);

    void cardLabel; // referenced for documentation in test failure traces
  }

  test('TC-NT01: should accept notification permission and exercise all system + in-app notification triggers', async ({ driver }) => {
    const notificationsPage = await gotoNotifications(driver);

    await notificationsPage.waitForDialog();
    expect(await notificationsPage.isDialogDisplayed()).toBe(true);
    await notificationsPage.acceptNotificationPermission();
    await notificationsPage.waitForPageLoad();

    await assertPageShell(notificationsPage, notificationsPage.permissionGranted, 'permission granted');
    await notificationsPage.exerciseAllTriggers();
  });

  test('TC-NT02: should deny notification permission and exercise all triggers with denied card status', async ({ driver }) => {
    const notificationsPage = await gotoNotifications(driver);

    await notificationsPage.waitForDialog();
    expect(await notificationsPage.isDialogDisplayed()).toBe(true);
    await notificationsPage.denyNotificationPermission();
    await notificationsPage.waitForPageLoad();

    await assertPageShell(notificationsPage, notificationsPage.permissionDenied, 'permission denied');
    await notificationsPage.exerciseAllTriggers();
  });

  test('TC-NT03: should suppress the OS dialog after two denies (permanent denial) and exercise all triggers', async ({ driver }) => {
    const navMenu = new NavMenuPage(driver);
    const notificationsPage = await gotoNotifications(driver);

    // 1st deny — Android 13+ allows a 2nd dialog after one deny.
    await notificationsPage.waitForDialog();
    await notificationsPage.denyNotificationPermission();
    await notificationsPage.waitForPageLoad();

    // Leave the page, return, and deny a second time — this triggers Android's
    // permanent-denial state where subsequent requests are auto-suppressed.
    await driver.$(notificationsPage.backBtn).click();
    await driver.pause(1000);
    await navMenu.open();
    await navMenu.navigateTo(navMenu.navNotifications);

    await notificationsPage.waitForDialog();
    await notificationsPage.denyNotificationPermission();
    await notificationsPage.waitForPageLoad();

    // Third entry: dialog should NOT appear.
    await driver.$(notificationsPage.backBtn).click();
    await driver.pause(1000);
    await navMenu.open();
    await navMenu.navigateTo(navMenu.navNotifications);
    await notificationsPage.waitForPageLoad();

    expect(await notificationsPage.isDialogDisplayed()).toBe(false);

    // After permanent denial the card is the same default text as a fresh
    // first-launch (verified via dumps/nt03_after_two_denies.xml) — NOT the
    // "Permission denied — notifications may not appear" status.
    await assertPageShell(notificationsPage, notificationsPage.noNotificationsYet, 'no notifications sent yet (permanently denied)');
    await notificationsPage.exerciseAllTriggers();
  });
});
