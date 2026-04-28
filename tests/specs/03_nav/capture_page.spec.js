// @ts-check
const { test } = require('../../../fixtures/appFixture');

test('Login Screen Discovery Tablet', async ({ driver }) => {
  await driver.pause(2000); // Wait for animations to settle
  const source = await driver.getPageSource();
  console.log('--- LOGIN_XML_DUMP_START ---');
  console.log(source);
  console.log('--- LOGIN_XML_DUMP_END ---');
});
