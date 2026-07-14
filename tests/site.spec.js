import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/de/',
  '/404.html',
  '/legal-notice/',
  '/privacy/',
  '/terms/',
  '/de/impressum/',
  '/de/datenschutz/',
  '/de/agb/',
];

const formEndpoint = 'https://formcarry.com/s/c037Ctr8vBU';

for (const route of routes) {
  test(`${route} loads without local errors or overflow`, async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    const failedLocalResponses = [];

    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('response', (response) => {
      const url = new URL(response.url());
      if (url.origin === 'http://127.0.0.1:4173' && response.status() >= 400) {
        failedLocalResponses.push(`${response.status()} ${url.pathname}`);
      }
    });

    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response?.ok()).toBeTruthy();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(150);

    const diagnostics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      brokenImages: Array.from(document.images)
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.getAttribute('src')),
    }));

    expect(diagnostics.overflow).toBe(false);
    expect(diagnostics.brokenImages).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(failedLocalResponses).toEqual([]);
  });
}

test('legal routes reflow without horizontal scrolling at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });

  for (const route of routes.slice(3)) {
    await page.goto(route);
    const dimensions = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  }
});

test('landing navigation and FAQ remain keyboard-friendly', async ({ page }, testInfo) => {
  await page.goto('/');
  const isMobile = testInfo.project.name === 'chromium-mobile';

  if (isMobile) {
    const menuButton = page.locator('[data-menu-button]');
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('link', { name: 'Reviews' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menuButton).toBeFocused();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await menuButton.click();
    await expect(page.getByRole('link', { name: 'Reviews' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'FAQ', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#faq-title')).toBeFocused();
  } else {
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  }

  await page.getByText('How do we start?', { exact: true }).click();
  await expect(page.locator('#faq-title')).not.toHaveAttribute('tabindex');
  await expect(page.locator('.faq details[open]')).toHaveCount(1);
  await expect(page.locator('.faq details').filter({ hasText: 'How do we start?' })).toHaveAttribute('open', '');
});

test('mobile navigation remains reachable in a short landscape viewport', async ({ page }) => {
  await page.setViewportSize({ width: 568, height: 320 });
  await page.goto('/');

  await page.locator('[data-menu-button]').click();
  const mobileNav = page.locator('[data-mobile-nav]');
  const menuLinks = mobileNav.getByRole('link');
  await expect(menuLinks).toHaveCount(4);

  for (let index = 0; index < await menuLinks.count(); index += 1) {
    const link = menuLinks.nth(index);
    await link.scrollIntoViewIfNeeded();
    const bounds = await link.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds.y).toBeGreaterThanOrEqual(-1);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(321);
  }

  expect(await mobileNav.evaluate((navigation) => navigation.scrollTop)).toBeGreaterThan(0);
  await menuLinks.last().click();
  await expect(page).toHaveURL('/de/');
});

test('no-JS and failed-script fallbacks keep content usable', async ({ browser }, testInfo) => {
  const viewport = testInfo.project.use.viewport;
  const noJsContext = await browser.newContext({ javaScriptEnabled: false, viewport });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto('/');
  await expect(noJsPage.locator('.reveal').first()).toBeVisible();
  if (testInfo.project.name === 'chromium-mobile') {
    await expect(noJsPage.locator('[data-menu-button]')).toBeHidden();
    await expect(noJsPage.locator('.desktop-nav .language-link')).toBeVisible();
  }
  await noJsContext.close();

  const failedContext = await browser.newContext({ viewport });
  await failedContext.route('**/assets/site.js*', (route) => route.abort());
  const failedPage = await failedContext.newPage();
  await failedPage.goto('/');
  await expect(failedPage.locator('html')).not.toHaveClass(/\bjs\b/);
  await expect(failedPage.locator('.reveal').first()).toBeVisible();
  if (testInfo.project.name === 'chromium-mobile') {
    await expect(failedPage.locator('[data-menu-button]')).toBeHidden();
  }
  await failedContext.close();
});

test('legal routes expose the expected language counterpart', async ({ page }) => {
  const pairs = [
    ['/legal-notice/', 'en', '/de/impressum/'],
    ['/privacy/', 'en', '/de/datenschutz/'],
    ['/terms/', 'en', '/de/agb/'],
    ['/de/impressum/', 'de', '/legal-notice/'],
    ['/de/datenschutz/', 'de', '/privacy/'],
    ['/de/agb/', 'de', '/terms/'],
  ];

  for (const [route, lang, counterpart] of pairs) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    const counterpartLink = page.locator(`a[href="${counterpart}"]`);
    await expect(counterpartLink).toHaveCount(1);
    if (!(await counterpartLink.isVisible())) await page.locator('.hamburger').click();
    await expect(counterpartLink).toBeVisible();
    await expect(page.locator('a[aria-current="page"]')).toHaveCount(1);
  }
});

test('form success sends one sanitized request', async ({ page }) => {
  let requestCount = 0;
  let submittedBody = '';
  await page.route(formEndpoint, async (route) => {
    requestCount += 1;
    submittedBody = route.request().postData() ?? '';
    await new Promise((resolve) => setTimeout(resolve, 200));
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.goto('/?utm_source=ci#apply');
  await page.getByLabel('Name').fill('Test User');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Role and organization').fill('CEO, Test GmbH');
  await page.getByLabel('What leadership challenge would make this coaching worthwhile?').fill('Test outcome');
  const submit = page.getByRole('button', { name: 'Request a Coaching Partnership' });
  await submit.click();
  await page.evaluate(() => {
    document.querySelector('[data-contact-form]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  await expect(page.locator('[data-form-status]')).toHaveClass(/is-success/);

  expect(requestCount).toBe(1);
  expect(submittedBody).toContain('name="role_company"');
  expect(submittedBody).toContain('CEO, Test GmbH');
  expect(submittedBody).toContain('http://127.0.0.1:4173/');
  expect(submittedBody).not.toContain('utm_source');
  expect(submittedBody).not.toContain('apply');
});

test('form failures preserve values and allow manual retry', async ({ page }) => {
  let shouldSucceed = false;
  await page.route(formEndpoint, (route) => {
    if (shouldSucceed) return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    return route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
  });

  await page.goto('/de/');
  await page.getByLabel('Name').fill('Test Nutzer');
  await page.getByLabel('E-Mail').fill('test@example.com');
  await page.getByLabel('Rolle und Organisation').fill('CEO, Test GmbH');
  await page.getByLabel('Bei welcher Führungsherausforderung würde dieses Coaching den größten Unterschied machen?').fill('Testziel');
  await page.getByRole('button', { name: 'Coaching-Partnerschaft anfragen' }).click();

  await expect(page.getByLabel('Name')).toHaveValue('Test Nutzer');
  await expect(page.getByRole('button', { name: 'Erneut versuchen' })).toBeEnabled();
  shouldSucceed = true;
  await page.getByRole('button', { name: 'Erneut versuchen' }).click();
  await expect(page.locator('[data-form-status]')).toHaveClass(/is-success/);
});

test('form timeout is honest and retryable', async ({ page }) => {
  test.setTimeout(25_000);
  await page.route(formEndpoint, () => new Promise(() => {}));
  await page.goto('/');
  await page.getByLabel('Name').fill('Timeout Test');
  await page.getByLabel('Email').fill('timeout@example.com');
  await page.getByLabel('Role and organization').fill('CEO, Timeout GmbH');
  await page.getByLabel('What leadership challenge would make this coaching worthwhile?').fill('Timeout behavior');
  await page.getByRole('button', { name: 'Request a Coaching Partnership' }).click();

  await expect(page.getByRole('button', { name: 'Try again' })).toBeEnabled({ timeout: 17_000 });
  await expect(page.locator('[data-form-status]')).toContainText('too long to confirm');
  await expect(page.getByLabel('Name')).toHaveValue('Timeout Test');
});
