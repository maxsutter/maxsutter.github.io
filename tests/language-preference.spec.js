import { expect, test } from '@playwright/test';

const languageLinks = [
  ['/legal-notice/', 'de', '/de/impressum/'],
  ['/privacy/', 'de', '/de/datenschutz/'],
  ['/terms/', 'de', '/de/agb/'],
  ['/de/impressum/', 'en', '/legal-notice/'],
  ['/de/datenschutz/', 'en', '/privacy/'],
  ['/de/agb/', 'en', '/terms/'],
  ['/404.html', 'en', '/'],
  ['/404.html', 'de', '/de/'],
];

test('explicit language links persist the landing-page preference', async ({ page }) => {
  for (const [route, language, destination] of languageLinks) {
    await page.goto(route);
    await page.evaluate(() => window.localStorage.removeItem('preferredLanguage'));

    const link = page.locator(`[data-language-link="${language}"][href="${destination}"]`);
    if (!(await link.isVisible())) await page.locator('.hamburger').click();
    await link.click();

    await expect(page).toHaveURL(new RegExp(`${destination.replaceAll('/', '\\/')}$`));
    expect(await page.evaluate(() => window.localStorage.getItem('preferredLanguage'))).toBe(language);
  }

  await page.goto('/de/');
  await expect(page.locator('[data-language-suggestion]')).toBeHidden();
});
