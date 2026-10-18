import { expect, test, type Page } from '@playwright/test';

// The SDK is replaced with an empty script, so window.posthog stays the snippet's
// stub and every call is kept as [method, ...args] instead of being sent.
type Call = [string, string, Record<string, any>?];
async function captured(page: Page, event?: string) {
  const calls = await page.evaluate(() => Array.from((window as any).posthog ?? []) as Call[]);
  return calls.filter(([method, name]) => method === 'capture' && (!event || name === event)).map(([, name, properties]) => ({ event: name, properties: properties ?? {} }));
}
const preventNavigation = (element: Element) => {
  element.addEventListener('click', event => event.preventDefault(), { once: true });
  (element as HTMLElement).click();
};

test.beforeEach(async ({ page }) => {
  // Browser tests must never send synthetic traffic to production analytics.
  await page.route(/posthog\.com\//, route => route.abort());
  await page.route('**/t/**', route => route.fulfill({ body: '', contentType: 'application/javascript' }));
});

test('records one pageview and one opened event per navigation, including history', async ({ page }) => {
  await page.goto('/projects/mars');
  await expect.poll(async () => (await captured(page, '$pageview')).length).toBe(1);
  for (const path of ['/projects', '/projects/pushstack', '/projects']) {
    await page.locator(`a[href="${path}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
  }
  await expect.poll(async () => (await captured(page, '$pageview')).length).toBe(4);
  const views = await captured(page, '$pageview');
  expect(views.map(view => view.properties.$pathname)).toEqual(['/projects/mars', '/projects', '/projects/pushstack', '/projects']);
  expect(views[2].properties.title).toContain('PushStack');
  expect((await captured(page, 'project_opened')).map(e => e.properties.project_id)).toEqual(['mars', 'pushstack']);

  await page.goBack();
  await expect.poll(async () => (await captured(page, '$pageview')).length).toBe(5);
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  expect(await captured(page, '$pageview')).toHaveLength(6);
});

test('captures declared card, navigation, project, contact, and outbound clicks', async ({ page }) => {
  await page.goto('/projects');
  const card = page.locator('[data-analytics-event="project_card_clicked"]').first();
  await card.dispatchEvent('auxclick', { button: 1 });
  expect((await captured(page, 'project_card_clicked'))[0].properties).toMatchObject({ card_placement: 'featured' });
  await card.click();
  await expect.poll(async () => (await captured(page, 'project_opened')).length).toBe(1);
  await page.locator('[data-analytics-event="external_project_link_clicked"]').first().evaluate(preventNavigation);
  expect((await captured(page, 'external_project_link_clicked'))[0].properties.project_title).toBeTruthy();
  await page.locator('a[href="https://github.com/nandan-varma"]').first().evaluate(preventNavigation);
  expect((await captured(page, 'outbound_link_clicked'))[0].properties.link_domain).toBe('github.com');

  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
  await page.locator('a[href="/contact"]').first().click();
  await expect(page).toHaveURL(/\/contact$/);
  expect((await captured(page, 'navigation_link_clicked')).at(-1)!.properties.nav_destination).toBe('/contact');
  await page.locator('[data-analytics-event="contact_link_clicked"]').first().evaluate(preventNavigation);
  expect((await captured(page, 'contact_link_clicked'))[0].properties.contact_type).toBe('email');
  // Declared events are not double-counted as outbound links.
  expect(await captured(page, 'outbound_link_clicked')).toHaveLength(1);
});

test('records 404s and keeps private recommendation values out of analytics', async ({ page }) => {
  await page.goto('/this-page-does-not-exist');
  await expect.poll(async () => (await captured(page, 'page_not_found')).length).toBe(1);
  expect((await captured(page, 'page_not_found'))[0].properties).toHaveProperty('referrer', null);

  await page.goto('/recommend');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => {} } }));
  await page.locator('[data-reveal]').first().click();
  expect(await captured(page, 'recommend_field_revealed')).toHaveLength(1);
  const privateValue = await page.locator('[data-reveal]').first().getAttribute('data-value');
  expect(privateValue).toBeTruthy();
  expect(JSON.stringify(await captured(page))).not.toContain(privateValue!);
  await expect(page.locator('main.ph-no-capture')).toHaveCount(1);
});
