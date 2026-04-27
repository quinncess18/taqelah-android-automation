// @ts-check
const { test } = require('../../fixtures/appFixture');
const { LoginPage } = require('../pages/LoginPage');
const { CatalogLandingPage } = require('../pages/CatalogLandingPage');

test('Discovery: Casual Category UI Dump', async ({ driver }) => {
  const loginPage = new LoginPage(driver);
  const landingPage = new CatalogLandingPage(driver);

  await loginPage.waitForPageLoad();
  await loginPage.login(null, '10203040');
  
  // Navigate to Casual
  await (await driver.$(landingPage.categoryCasual)).click();
  await driver.pause(3000); // Wait for items to load

  const source = await driver.getPageSource();
  console.log('--- CASUAL_DUMP_START ---');
  console.log(source);
  console.log('--- CASUAL_DUMP_END ---');
});
