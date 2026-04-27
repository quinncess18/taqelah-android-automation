// @ts-check
const { test, expect } = require('../../../fixtures/appFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { CatalogLandingPage } = require('../../pages/CatalogLandingPage');
const { ProductGridPage } = require('../../pages/ProductGridPage');
const products = require('../../data/products');

test.describe('Catalog Module - Category Data Integrity', () => {
  let landingPage;
  let gridPage;

  test.beforeAll(async ({ driver }) => {
    landingPage = new CatalogLandingPage(driver);
    gridPage = new ProductGridPage(driver);
    
    // Ensure we are starting from the Homepage for the suite
    // Note: C08 handled the transition from the previous Grid state.
  });

  test('TC-C08: should verify Casual Dresses integrity and data parity', async ({ driver }) => {
    // Transition from previous session state (Sitting on All Dresses)
    await driver.back();
    await driver.pause(1000);

    const data = products.categories.casual;
    await landingPage.selectCategory(data.name);
    
    expect(await (await driver.$(gridPage.gridTitle(data.name))).isDisplayed()).toBe(true);
    const integrityPass = await gridPage.verifyCategoryIntegrity(data);
    expect(integrityPass).toBe(true);

    await driver.back(); // Return Home
    await driver.pause(1000);
  });

  test('TC-C09: should verify Evening Dresses integrity and data parity', async ({ driver }) => {
    const data = products.categories.evening;
    
    // 1. Direct Entry from Home
    await landingPage.selectCategory(data.name);
    
    // 2. Data Audit (Handles device-specific settle tugs internally)
    expect(await (await driver.$(gridPage.gridTitle(data.name))).isDisplayed()).toBe(true);
    const integrityPass = await gridPage.verifyCategoryIntegrity(data);
    expect(integrityPass).toBe(true);

    // 3. Return Home
    await driver.back();
    await driver.pause(1000);
  });

  test('TC-C10: should verify Party Dresses integrity and data parity', async ({ driver }) => {
    const data = products.categories.party;
    
    // 1. Direct Entry from Home
    await landingPage.selectCategory(data.name);
    
    // 2. Data Audit
    expect(await (await driver.$(gridPage.gridTitle(data.name))).isDisplayed()).toBe(true);
    const integrityPass = await gridPage.verifyCategoryIntegrity(data);
    expect(integrityPass).toBe(true);

    // 3. Return Home
    await driver.back();
    await driver.pause(1000);
  });

  test('TC-C11: should verify Boho Dresses integrity and data parity', async ({ driver }) => {
    const data = products.categories.boho;
    
    // 1. Direct Entry from Home
    await landingPage.selectCategory(data.name);
    
    // 2. Data Audit
    expect(await (await driver.$(gridPage.gridTitle(data.name))).isDisplayed()).toBe(true);
    const integrityPass = await gridPage.verifyCategoryIntegrity(data);
    expect(integrityPass).toBe(true);

    // 3. Return Home
    await driver.back();
    await driver.pause(1000);
  });
});
