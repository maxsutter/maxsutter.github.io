import { expect, test } from '@playwright/test';

for (const route of ['/', '/de/']) {
  test(`${route} personal story opens by keyboard and returns to the same place`, async ({ page }) => {
    await page.goto(`${route}#about`);
    const trigger = page.locator('.story-trigger');
    const dialog = page.getByRole('dialog');
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('Enter');

    await expect(dialog).toBeVisible();
    await expect(dialog.locator('#story-title')).toBeFocused();
    await expect(dialog.locator('.story-article')).toHaveCount(1);
    expect(await page.evaluate(() => window.getComputedStyle(document.body).overflow)).toBe('hidden');

    // Native modal focus must not reach the navigation or contact form behind it.
    for (let index = 0; index < 6; index += 1) {
      await page.keyboard.press('Tab');
      // Chromium can move focus to browser chrome (document.body) between cycles.
      expect(await dialog.evaluate((element) => document.activeElement === document.body
        || element.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(page.locator('.personal-story .story-article')).toHaveCount(1);
    expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(scrollBefore, 0);
    expect(await page.evaluate(() => window.getComputedStyle(document.body).overflow)).not.toBe('hidden');

    await trigger.click();
    await expect(dialog).toBeVisible();
    expect(await dialog.locator('[data-story-content]').evaluate((element) => element.scrollTop)).toBe(0);
    await dialog.locator('.story-return').click();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test(`${route} personal story can be read and closed on a narrow screen`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(`${route}#about`);
    await page.locator('.story-trigger').click();
    const dialog = page.getByRole('dialog');
    const finalParagraph = dialog.locator('.story-article > p').last();
    await finalParagraph.scrollIntoViewIfNeeded();
    await expect(finalParagraph).toBeInViewport();
    await expect(dialog.locator('.story-close')).toBeInViewport();
    await expect(dialog.locator('.story-return')).toBeInViewport();
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await dialog.locator('.story-close').click();
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('.story-trigger')).toBeFocused();
  });

  test(`${route} personal story remains readable without JavaScript`, async ({ browser, baseURL }, testInfo) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: testInfo.project.use.viewport });
    const page = await context.newPage();
    await page.goto(`${route}#about`);
    await page.locator('.story-trigger').press('Enter');
    await expect(page.locator('.personal-story')).toHaveAttribute('open', '');
    await expect(page.locator('.personal-story .story-article')).toBeVisible();
    await expect(page.locator('#story-dialog')).not.toBeVisible();
    await context.close();
  });
}

test('the backdrop closes the story without intercepting clicks inside it', async ({ page }) => {
  await page.goto('/#about');
  await page.locator('.story-trigger').click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('.story-lede').click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('.story-trigger')).toBeFocused();
});
