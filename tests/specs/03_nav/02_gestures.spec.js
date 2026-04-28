// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
const { NavMenuPage } = require('../../pages/NavMenuPage');
const { GesturesPage } = require('../../pages/GesturesPage');

test.describe('Navigation - Gestures Interaction Suite (02)', () => {
  let loginPage;
  let landingPage;
  let navMenu;
  let gesturesPage;

  test.beforeAll(async ({ driver }) => {
    loginPage = new LoginPage(driver);
    landingPage = new CatalogLandingPage(driver);
    navMenu = new NavMenuPage(driver);
    gesturesPage = new GesturesPage(driver);

    // SELF-HEALING: Ensure we are logged in and on the Homepage
    const onLoginScreen = await driver.$(loginPage.usernameField).isDisplayed();
    if (onLoginScreen) {
        await loginPage.login(null, loginPage.defaultPass);
        await landingPage.waitForPageLoad();
    }
  });

  test('TC-M02: should verify Randomized Sequential Swipe Audit (5 Cards)', async ({ driver }) => {
    // 1. Navigate to Gestures
    await navMenu.open();
    await navMenu.navigateTo(navMenu.navGestures);
    await gesturesPage.waitForPageLoad();

    // 2. Randomized Audit Logic
    let availableCards = [1, 2, 3, 4, 5];
    while (availableCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        const cardId = availableCards.splice(randomIndex, 1)[0];
        
        const cardSelector = gesturesPage.swipeCard(cardId);
        const card = await driver.$(cardSelector);
        
        await card.waitForDisplayed({ timeout: 5000 });
        const location = await card.getLocation();
        const size = await card.getSize();
        
        const direction = Math.random() > 0.5 ? 'right' : 'left';
        const toastType = direction === 'right' ? 'favorited!' : 'deleted!';
        
        const startX = direction === 'right' ? Math.round(location.x + size.width * 0.2) : Math.round(location.x + size.width * 0.8);
        const endX = direction === 'right' ? Math.round(location.x + size.width * 0.9) : Math.round(location.x + size.width * 0.1);
        const centerY = Math.round(location.y + size.height * 0.5);

        await driver.performActions([{
            type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: startX, y: centerY },
                { type: 'pointerDown', button: 0 },
                { type: 'pause', duration: 300 }, 
                { type: 'pointerMove', duration: 200, origin: 'viewport', x: endX, y: centerY },
                { type: 'pointerUp', button: 0 }
            ]
        }]);

        const expectedToast = `Swipe Card ${cardId} ${toastType}`;
        const toast = await driver.$(gesturesPage.toastMsg(expectedToast));
        await toast.waitForDisplayed({ timeout: 1600 });
        expect(await toast.isDisplayed()).toBe(true);

        await driver.pause(1000);
    }

    // 3. Reset State
    await (await driver.$(gesturesPage.backBtn)).click();
    await landingPage.waitForPageLoad();
  });

  test('TC-M03: should verify Randomized Drag & Drop Reorder (Dynamic Indexing)', async ({ driver }) => {
    // 1. Navigate to Gestures
    await navMenu.open();
    await navMenu.navigateTo(navMenu.navGestures);
    await gesturesPage.waitForPageLoad();

    // 2. Scroll to center the Drag & Drop section
    await gesturesPage.scrollToDragSection();

    // 3. Map the absolute Y-coordinates of the 5 slots
    const slotY = [];
    let itemHeight = 0;
    for (let i = 1; i <= 5; i++) {
        const item = await driver.$(gesturesPage.dragItemExact(i, i));
        await item.waitForDisplayed({ timeout: 5000 });
        const loc = await item.getLocation();
        const size = await item.getSize();
        itemHeight = size.height;
        slotY.push(Math.round(loc.y + size.height * 0.5));
    }

    // 4. Perform Random Shuffle based on current physical positions
    const itemsToDrag = [1, 2, 3, 4, 5];
    
    for (const sourceId of itemsToDrag) {
        const sourceItem = await driver.$(gesturesPage.dragItem(sourceId));
        const sourceLoc = await sourceItem.getLocation();
        const sourceSize = await sourceItem.getSize();

        const centerX = Math.round(sourceLoc.x + sourceSize.width * 0.5);
        const startY = Math.round(sourceLoc.y + sourceSize.height * 0.5);
        
        // Determine the current slot based on Y-coordinate proximity
        let currentSlotIndex = 0;
        let minDiff = Infinity;
        for (let j = 0; j < 5; j++) {
            const diff = Math.abs(slotY[j] - startY);
            if (diff < minDiff) {
                minDiff = diff;
                currentSlotIndex = j;
            }
        }

        // Pick a random target slot that is DIFFERENT from the current slot
        let targetSlotIndex = Math.floor(Math.random() * 5);
        while (targetSlotIndex === currentSlotIndex) {
            targetSlotIndex = Math.floor(Math.random() * 5);
        }

        const endY = slotY[targetSlotIndex];

        // "Human Lift" Drag: 1500ms long press, 700ms drag to exact center, 200ms settle before drop
        await driver.performActions([{
            type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: centerX, y: startY },
                { type: 'pointerDown', button: 0 },
                { type: 'pause', duration: 1500 }, // 1.5s long press
                { type: 'pointerMove', duration: 50, origin: 'viewport', x: centerX, y: startY - 20 }, // The "Lift"
                { type: 'pointerMove', duration: 700, origin: 'viewport', x: centerX, y: endY }, // Quick drag to exact slot center
                { type: 'pause', duration: 200 }, // Let Flutter UI lock the slot
                { type: 'pointerUp', button: 0 }
            ]
        }]);

        // Observation 1: Pause 1 second after the item is dragged to verify index changing
        await driver.pause(1000);
    }

    // 5. Return to DemoApp page
    await (await driver.$(gesturesPage.backBtn)).click();
    await landingPage.waitForPageLoad();
    
    // Pause 1 second after navigating to DemoApp page
    await driver.pause(1000);
    
    // 6. Return to Gesture Demo page to verify reset
    await navMenu.open();
    await navMenu.navigateTo(navMenu.navGestures);
    await gesturesPage.waitForPageLoad();
    
    // Scroll to center the Drag & Drop section again before verification
    await gesturesPage.scrollToDragSection();

    // 7. Verify default state returns to how it was
    for (let i = 1; i <= 5; i++) {
        const originalItem = await driver.$(gesturesPage.dragItemExact(i, i));
        await originalItem.waitForDisplayed({ timeout: 5000 });
        expect(await originalItem.isDisplayed()).toBe(true);
    }
  });
});
