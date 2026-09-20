const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const BASE_URL = 'http://localhost:3001';

  console.log('Navigating to login...');
  await page.goto(`${BASE_URL}/login`);

  console.log('Filling login form...');
  await page.fill('input[name="email"]', 'shivani@tuiton.app');
  await page.fill('input[name="password"]', 'tuiton123');

  console.log('Clicking submit...');
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForURL('**/admin', { timeout: 15000 });

  console.log('Current URL:', page.url());

  // Test navigation to various pages
  const pages = [
    '/dashboard', '/roadmaps', '/roadmaps/stem-fundamentals',
    '/live', '/challenges', '/leaderboard', '/profile', '/community', '/admin'
  ];

  for (const path of pages) {
    try {
      await page.goto(`${BASE_URL}${path}`);
      const content = await page.textContent('body');
      if (content.includes('404') || content.includes('This page could not be found')) {
        console.log(`❌ ${path} -> 404`);
      } else {
        console.log(`✅ ${path} -> OK`);
      }
    } catch (e) {
      console.log(`❌ ${path} -> ERROR: ${e.message}`);
    }
  }

  await browser.close();
  console.log('Test complete');
})();
