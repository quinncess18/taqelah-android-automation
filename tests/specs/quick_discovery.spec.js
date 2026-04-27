// @ts-check
const { test } = require('../../fixtures/appFixture');

test('Quick Discovery: Capture All Category Items', async ({ driver }) => {
  console.log('--- CATEGORY_DUMP_START ---');
  
  // Capture first 6 items
  const source1 = await driver.getPageSource();
  console.log(source1);
  
  // Small flick to reveal the last 2 items
  const { width, height } = await driver.getWindowRect();
  const safeX = Math.round(width * 0.3);
  await driver.performActions([
    {
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: safeX, y: Math.round(height * 0.8) },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerMove', duration: 800, origin: 'viewport', x: safeX, y: Math.round(height * 0.2) },
        { type: 'pointerUp', button: 0 },
      ],
    }
  ]);
  await driver.pause(1500);

  // Capture final items
  const source2 = await driver.getPageSource();
  console.log('--- SECOND_FLICK_XML ---');
  console.log(source2);
  
  console.log('--- CATEGORY_DUMP_END ---');
});
