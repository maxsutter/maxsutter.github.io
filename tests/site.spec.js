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

const landingPages = [
  {
    route: '/', language: 'en', about: 'About me', email: 'Email', role: 'Role and organization',
    outcome: 'What brings you here, and what would you like to change?',
    submit: 'Request an intro call', retry: 'Try again', resend: 'Send again anyway', uncertain: 'may already have arrived',
  },
  {
    route: '/de/', language: 'de', about: 'Über mich', email: 'E-Mail', role: 'Rolle und Organisation',
    outcome: 'Was führt dich gerade hierher – und was möchtest du verändern?',
    submit: 'Kennenlerngespräch anfragen', retry: 'Erneut versuchen', resend: 'Trotzdem erneut senden', uncertain: 'kann bereits angekommen sein',
  },
];

test.beforeEach(async ({ page }) => {
  await page.route(formEndpoint, (route) => route.abort());
});

async function fillInquiry(page, copy) {
  await page.getByLabel('Name', { exact: true }).fill('Test User');
  await page.getByLabel(copy.email, { exact: true }).fill('test@example.com');
  await page.getByLabel(copy.role, { exact: true }).fill('CEO, Test GmbH');
  await page.getByLabel(copy.outcome, { exact: true }).fill('Test coaching inquiry');
}


test('/agb redirects to the German terms page', async ({ page }) => {
  await page.goto('/agb');
  await expect(page).toHaveURL('/de/agb/');
  await expect(page.getByRole('heading', { name: 'Allgemeine Geschäftsbedingungen' })).toBeVisible();
});

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

for (const copy of landingPages) {
  test(`${copy.route} navigation and FAQ remain keyboard-friendly`, async ({ page }, testInfo) => {
    await page.goto(copy.route);
    const isMobile = testInfo.project.use.viewport.width <= 900;

    if (isMobile) {
      const menuButton = page.locator('[data-menu-button]');
      const nav = page.locator('[data-mobile-nav]');
      await menuButton.click();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      await expect(nav.getByRole('link', { name: 'Coaching', exact: true })).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(menuButton).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(nav.getByRole('link').last()).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(menuButton).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(menuButton).toBeFocused();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      await menuButton.click();
      await page.keyboard.press('Tab');
      await expect(nav.getByRole('link', { name: copy.about, exact: true })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('#about-title')).toBeFocused();
    } else {
      const nav = page.locator('.desktop-nav');
      await expect(nav).toBeVisible();
      for (const anchor of ['coaching', 'about', 'partnership', 'get-in-touch']) {
        await nav.locator(`a[href="#${anchor}"]`).click();
        await expect(page).toHaveURL(new RegExp(`#${anchor}$`));
        await expect(page.locator(`#${anchor}`)).toBeInViewport();
      }
    }

    const first = page.locator('.faq details').nth(0);
    const second = page.locator('.faq details').nth(1);
    await first.locator('summary').click();
    await expect(page.locator('#about-title')).not.toHaveAttribute('tabindex');
    await expect(first).toHaveAttribute('open', '');
    await second.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('open', '');
    await expect(page.locator('.faq details[open]')).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(page.locator('.faq details[open]')).toHaveCount(0);
  });

  test(`${copy.route} new sections reflow at small and tablet widths`, async ({ page }) => {
    for (const width of [320, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(copy.route);
      for (const anchor of ['hero', 'coaching', 'about', 'reviews', 'work', 'partnership', 'faq', 'get-in-touch']) {
        const section = page.locator(`#${anchor}`);
        await section.scrollIntoViewIfNeeded();
        await expect(section).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
      await page.locator('#about').scrollIntoViewIfNeeded();
      await expect(page.locator('.about-portrait img')).toHaveJSProperty('complete', true);
      expect(await page.locator('.about-portrait img').evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
    }
  });
}

test('mobile navigation remains reachable in a short landscape viewport', async ({ page }) => {
  await page.setViewportSize({ width: 568, height: 320 });
  await page.goto('/');

  await page.locator('[data-menu-button]').click();
  const mobileNav = page.locator('[data-mobile-nav]');
  const menuLinks = mobileNav.getByRole('link');
  await expect(menuLinks).toHaveCount(5);

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

for (const copy of landingPages) {
  test(`${copy.route} form validates required fields before sending`, async ({ page }) => {
    let requestCount = 0;
    await page.route(formEndpoint, (route) => {
      requestCount += 1;
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page.goto(copy.route);
    const submit = page.getByRole('button', { name: copy.submit, exact: true });
    await submit.click();
    expect(requestCount).toBe(0);
    await fillInquiry(page, copy);
    await page.getByLabel(copy.email, { exact: true }).fill('invalid-email');
    await submit.click();
    await expect(page.locator('#email:invalid')).toBeVisible();
    expect(requestCount).toBe(0);
    await page.getByLabel(copy.email, { exact: true }).fill('test@example.com');
    await page.getByLabel(copy.outcome, { exact: true }).fill('');
    await submit.click();
    expect(requestCount).toBe(0);
    await expect(page.locator('[data-contact-form]')).not.toHaveAttribute('aria-busy', 'true');
  });

  test(`${copy.route} form success sends one sanitized request`, async ({ page }) => {
    let requestCount = 0;
    let submittedBody = '';
    await page.route(formEndpoint, async (route) => {
      requestCount += 1;
      submittedBody = route.request().postData() ?? '';
      await new Promise((resolve) => setTimeout(resolve, 200));
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page.goto(`${copy.route}?utm_source=ci#get-in-touch`);
    await fillInquiry(page, copy);
    await page.getByRole('button', { name: copy.submit, exact: true }).click();
    await page.evaluate(() => {
      document.querySelector('[data-contact-form]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    const confirmation = page.locator('[data-form-confirmation]');
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toBeFocused();
    await expect(confirmation).toBeInViewport({ ratio: 1 });
    await expect(page.locator('[data-contact-form]')).toBeHidden();
    await expect(page.getByRole('button', { name: copy.submit, exact: true })).toHaveCount(0);
    const startedAgain = await page.locator('[data-contact-form]').evaluate((form) => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      return form.getAttribute('aria-busy');
    });
    expect(startedAgain).toBeNull();
    expect(requestCount).toBe(1);
    expect(submittedBody).toContain('name="role_company"');
    expect(submittedBody).toContain('name="outcome"');
    expect(submittedBody).toContain(`name="language"\r\n\r\n${copy.language}`);
    expect(submittedBody).toContain('CEO, Test GmbH');
    expect(submittedBody).toContain('Test coaching inquiry');
    expect(submittedBody).toContain(`http://127.0.0.1:4173${copy.route}`);
    expect(submittedBody).not.toContain('utm_source');
    expect(submittedBody).not.toContain('get-in-touch');
    expect(submittedBody).not.toContain('name="readiness"');
  });

  test(`${copy.route} form failures preserve values and allow manual retry`, async ({ page }) => {
    let shouldSucceed = false;
    await page.route(formEndpoint, (route) => route.fulfill({
      status: shouldSucceed ? 200 : 500, contentType: 'application/json', body: '{}',
    }));
    await page.goto(copy.route);
    await fillInquiry(page, copy);
    await page.getByRole('button', { name: copy.submit, exact: true }).click();
    await expect(page.locator('[data-form-status]')).toHaveClass(/is-error/);
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Test User');
    await expect(page.getByLabel(copy.outcome, { exact: true })).toHaveValue('Test coaching inquiry');
    await expect(page.getByRole('button', { name: copy.retry })).toBeEnabled();
    shouldSucceed = true;
    await page.getByRole('button', { name: copy.retry }).click();
    await expect(page.locator('[data-form-confirmation]')).toBeVisible();
  });

  for (const failure of ['timeout', 'network']) {
    test(`${copy.route} form ${failure} explains uncertainty before an intentional resend`, async ({ page }) => {
      await page.clock.install();
      let requestCount = 0;
      await page.route(formEndpoint, (route) => {
        requestCount += 1;
        if (requestCount > 1) return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
        if (failure === 'network') return route.abort('failed');
      });
      await page.goto(copy.route);
      await fillInquiry(page, copy);
      await page.getByRole('button', { name: copy.submit, exact: true }).click();
      await expect.poll(() => requestCount).toBe(1);
      if (failure === 'timeout') await page.clock.fastForward(15_001);
      await expect(page.locator('[data-form-status]')).toHaveClass(/is-uncertain/);
      await expect(page.locator('[data-form-status]')).toContainText(copy.uncertain);
      await expect(page.locator('[data-form-confirmation]')).toBeHidden();
      await expect(page.getByLabel(copy.outcome, { exact: true })).toHaveValue('Test coaching inquiry');
      const resend = page.getByRole('button', { name: copy.resend, exact: true });
      await expect(resend).toBeEnabled();
      await page.clock.fastForward(30_000);
      expect(requestCount).toBe(1);
      await resend.click();
      await expect(page.locator('[data-form-confirmation]')).toBeVisible();
      expect(requestCount).toBe(2);
    });
  }

  test(`${copy.route} form confirmation fits at 320px with reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route(formEndpoint, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    await page.goto(copy.route);
    await fillInquiry(page, copy);
    await page.getByRole('button', { name: copy.submit, exact: true }).click();
    const confirmation = page.locator('[data-form-confirmation]');
    await expect(confirmation).toBeFocused();
    await expect(confirmation).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
