import { expect, test } from '@playwright/test';

const offers = [
  { home: '/', route: '/team-offsites/', alternate: '/de/teams-offsites/', language: 'de', cta: 'Discuss your team offsite' },
  { home: '/de/', route: '/de/teams-offsites/', alternate: '/team-offsites/', language: 'en', cta: 'Euer Offsite besprechen' },
];

test.beforeEach(async ({ page }) => {
  await page.route('https://formcarry.com/**', (route) => route.abort());
});

for (const offer of offers) {
  test(`${offer.route} connects home, offer, contact and the matching translation`, async ({ page }, testInfo) => {
    const mobile = testInfo.project.use.viewport.width <= 900;
    await page.goto(offer.home);
    await page.locator(`.offer-entry a[href="${offer.route}"]`).click();
    await expect(page).toHaveURL(offer.route);
    await expect(page.locator('h1')).toBeVisible();

    await page.getByRole('link', { name: offer.cta, exact: true }).click();
    await expect(page).toHaveURL(`${offer.route}#get-in-touch`);
    await expect(page.locator('[data-contact-form]')).toBeInViewport();

    const details = page.locator('.faq details').first();
    await details.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('open', '');

    if (mobile) {
      const button = page.locator('[data-menu-button]');
      await button.click();
      const nav = page.locator('[data-mobile-nav]');
      await expect(nav.getByRole('link', { name: 'Coaching', exact: true })).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(button).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(nav.getByRole('link').last()).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(button).toBeFocused();
      await expect(nav).toBeHidden();
      await button.click();
    }
    const nav = page.locator(mobile ? '[data-mobile-nav]' : '.desktop-nav');
    await expect(nav.locator('[aria-current="page"]')).toHaveAttribute('href', offer.route);
    await nav.locator('[data-language-link]').click();
    await expect(page).toHaveURL(offer.alternate);
    await expect(page.locator('html')).toHaveAttribute('lang', offer.language);
    expect(await page.evaluate(() => window.localStorage.getItem('preferredLanguage'))).toBe(offer.language);
    await expect(page.locator('[data-language-suggestion]')).toBeHidden();

    await page.goto(offer.route);
    if (mobile) await page.locator('[data-menu-button]').click();
    await nav.getByRole('link', { name: 'Coaching', exact: true }).click();
    await expect(page).toHaveURL(`${offer.home}#coaching`);
    await expect(page.locator('#coaching')).toBeInViewport();
    if (mobile) await page.locator('[data-menu-button]').click();
    await nav.getByRole('link', { name: 'Teams & Offsites', exact: true }).click();
    await expect(page).toHaveURL(offer.route);
  });

  test(`${offer.route} remains usable at 320px without JavaScript`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 700 } });
    const page = await context.newPage();
    await page.route('https://formcarry.com/**', (route) => route.abort());
    await page.goto(offer.route);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.desktop-nav .language-link')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('link', { name: offer.cta, exact: true }).click();
    await expect(page.locator('[data-contact-form]')).toBeInViewport();
    await context.close();
  });
}
