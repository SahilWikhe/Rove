import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function journeyPosition(page: Page, progress: number) {
  await page.locator('#journey').evaluate((element, value) => {
    const sticky = element.querySelector<HTMLElement>('.journey-sticky')!;
    window.scrollTo({
      top:
        window.scrollY +
        element.getBoundingClientRect().top +
        ((element as HTMLElement).offsetHeight - sticky.offsetHeight) * value,
      behavior: 'instant',
    });
  }, progress);
}

test.beforeEach(async ({ page }) => {
  // Test SDK injection without sending CI traffic to the production dashboard.
  await page.route('**/_vercel/insights/script.js', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: 'window.__roveAnalyticsLoaded = true;',
    }),
  );
});

test('homepage hydrates, navigation works, and assets load without runtime errors', async ({
  page,
}) => {
  const errors: string[] = [];
  const failures: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(response.url());
  });
  await page.goto('/');
  await expect(page).toHaveTitle('Rove — A better way to get there.');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'A better way',
  );
  await expect(page.locator('.rove-site')).toHaveClass(/js-ready/);
  await page.getByRole('link', { name: 'Explore the journey' }).click();
  await expect(page).toHaveURL(/#experience$/);
  const broken = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute('href')!.slice(1))
        .filter((id) => !document.getElementById(id)),
    );
  expect(broken).toEqual([]);
  expect(errors).toEqual([]);
  expect(failures).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
});

test('navigation supports mobile opening, Escape, and link selection', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  const menu = page.getByRole('button', { name: /^(Open|Close) navigation$/ });
  if (isMobile) {
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
    await menu.click();
  }
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Our purpose' })
    .click();
  await expect(page).toHaveURL(/#purpose$/);
  if (isMobile) await expect(menu).toHaveAttribute('aria-expanded', 'false');
});

test('native scrolling reaches every journey stage and reverses on desktop and phones', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.rove-site')).toHaveClass(/js-ready/);
  for (const [position, stage] of [
    [0.12, 0],
    [0.48, 1],
    [0.82, 2],
    [0.12, 0],
  ]) {
    await journeyPosition(page, position);
    await expect(page.locator('.rove-site')).toHaveAttribute(
      'data-stage',
      String(stage),
    );
    await expect(page.getByRole('tab').nth(stage)).toHaveAttribute(
      'aria-selected',
      'true',
    );
  }
});

test('reduced motion stops automatic playback while keyboard tabs still work', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.hero-demo')).toHaveAttribute(
    'data-playing',
    'false',
  );
  const tabs = page.getByRole('tab');
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: /Ride/ })).toContainText(
    'Know your ride.',
  );
  await tabs.nth(2).click();
  await expect(page.getByRole('tabpanel', { name: /Return/ })).toContainText(
    'Then home to life.',
  );
});

test('hero animation runs when visible and pauses offscreen', async ({
  page,
}) => {
  await page.goto('/');
  const hero = page.locator('.hero-demo');
  await hero.scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute('data-playing', 'true');
  const time = await hero.evaluate(
    (element) =>
      element
        .getAnimations({ subtree: true })
        .find((a) => a.playState === 'running')?.currentTime,
  );
  expect(time).toBeDefined();
  await expect
    .poll(() =>
      hero.evaluate(
        (element) =>
          element
            .getAnimations({ subtree: true })
            .find((a) => a.playState === 'running')?.currentTime,
      ),
    )
    .not.toBe(time);
  await page.locator('#pilot').scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute('data-playing', 'false');
});

test('analytics is injected once and is permitted by the content policy', async ({
  page,
}) => {
  await page.goto('/');
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(window, '__roveAnalyticsLoaded')),
    )
    .toBe(true);
  await expect(
    page.locator('script[src="/_vercel/insights/script.js"]'),
  ).toHaveCount(1);
  await page.getByRole('link', { name: 'Explore the journey' }).click();
  await expect(
    page.locator('script[src="/_vercel/insights/script.js"]'),
  ).toHaveCount(1);
});

test('essential content is available without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Explore the journey' }),
  ).toBeVisible();
  await context.close();
});

test('page meets automated WCAG A/AA checks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.rove-site')).toHaveClass(/js-ready/);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});
