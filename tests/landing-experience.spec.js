import { expect, test } from '@playwright/test';

for (const [route, wordBoundary] of [['/', 'more to'], ['/de/', 'tragen, um']]) {
  test(`${route} mobile introduction keeps the contact action in reach`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.hero .cta')).toBeInViewport({ ratio: 1 });
    await expect(page.locator('.hero .eyebrow')).toBeInViewport({ ratio: 1 });
  });

  test(`${route} mobile method heading keeps spaces at its desktop line break`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    await page.locator('#work').scrollIntoViewIfNeeded();
    expect(await page.locator('#work-title').innerText()).toContain(wordBoundary);
  });
}
