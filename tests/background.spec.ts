import { expect, test } from '@playwright/test';
import type { BackgroundAnimationController } from '../src/lib/animations/backgroundAnimationController';

declare global {
  interface Window {
    __backgroundController?: BackgroundAnimationController;
    __paintedSwaps: boolean[];
    __oldCanvas: HTMLCanvasElement;
    __draws: number;
  }
}

test.beforeEach(async ({ page }) => {
  // Browser tests must never send synthetic traffic to production analytics.
  await page.route(/posthog\.com\//, route => route.abort());
});

test('keeps the same scene through section navigation and history', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => !!window.__backgroundController);
  const canvas = await page.locator('canvas').elementHandle();
  const controller = await page.evaluateHandle(() => window.__backgroundController);
  for (const path of ['/projects', '/blog', '/contact', '/']) {
    await page.locator(`a[href="${path}"]`).first().click();
    await expect(page).toHaveURL(new URL(path, page.url()).href);
    expect(await canvas!.evaluate(element => element === document.querySelector('canvas'))).toBe(true);
    expect(await controller.evaluate(value => value === window.__backgroundController)).toBe(true);
  }
  await expect(page.locator('canvas')).toHaveAttribute('data-text', 'Nandan Varma');
  await page.goBack();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator('canvas')).toHaveAttribute('data-text', '');
  await page.goForward();
  await expect(page.locator('canvas')).toHaveAttribute('data-text', 'Nandan Varma');
});

test('paints destination canvases before the transition snapshot', async ({ page }) => {
  // The lifecycle listener must also be installed on a direct article visit.
  await page.goto('/blog/browser');
  await page.evaluate(() => {
    window.__paintedSwaps = [];
    document.addEventListener('astro:after-swap', () => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      const context = canvas.getContext('2d')!;
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let painted = false;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i]) { painted = true; break; }
      }
      window.__paintedSwaps.push(painted);
    });
  });
  await page.locator('a[href="/blog"]').first().click();
  await expect(page).toHaveURL(/\/blog$/);
  await page.locator('a[href="/"]').first().click();
  await expect(page).toHaveURL(new URL('/', page.url()).href);
  expect(await page.evaluate(() => window.__paintedSwaps)).toEqual([true, true]);
});

test('stops drawing to the old canvas on an article', async ({ page }) => {
  await page.goto('/blog');
  await page.waitForFunction(() => !!window.__backgroundController);
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas')!;
    const context = canvas.getContext('2d')!;
    const clear = context.clearRect.bind(context);
    window.__oldCanvas = canvas;
    window.__draws = 0;
    context.clearRect = (...args) => { window.__draws++; clear(...args); };
  });
  await page.locator('a[href="/blog/browser"]').first().click();
  await expect(page).toHaveURL(/\/blog\/browser$/);
  await expect.poll(() => page.evaluate(() => !!window.__backgroundController)).toBe(false);
  const count = await page.evaluate(() => window.__draws);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.__draws)).toBe(count);
  expect(await page.evaluate(() => window.__oldCanvas.isConnected)).toBe(false);
});

test('respects motion changes and repaints native-resolution resizes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => !!window.__backgroundController);
  await page.evaluate(() => {
    const context = document.querySelector('canvas')!.getContext('2d')!;
    const clear = context.clearRect.bind(context);
    window.__draws = 0;
    context.clearRect = (...args) => { window.__draws++; clear(...args); };
  });
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.__draws)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => page.evaluate(() => window.__draws)).toBeGreaterThan(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  const count = await page.evaluate(() => window.__draws);
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.__draws)).toBe(count);
  await page.setViewportSize({ width: 812, height: 375 });
  await expect.poll(() => page.evaluate(() => {
    const canvas = document.querySelector('canvas')!;
    return canvas.width === Math.round(innerWidth * devicePixelRatio)
      && canvas.height === Math.round(innerHeight * devicePixelRatio)
      && canvas.getContext('2d')!.getImageData(30, 30, 1, 1).data[3] > 0;
  })).toBe(true);
});

test('handles a new navigation during an unfinished transition', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(() => {
    const destinations = ['/blog', '/contact', '/blog', '/blog/browser'];
    document.addEventListener('astro:after-swap', () => {
      const next = destinations.shift();
      if (next) queueMicrotask(() => document.querySelector<HTMLAnchorElement>(`a[href="${next}"]`)!.click());
    });
    document.querySelector<HTMLAnchorElement>('a[href="/projects"]')!.click();
  });
  await expect(page).toHaveURL(/\/blog\/browser$/);
  await expect.poll(() => page.evaluate(() => !!window.__backgroundController)).toBe(false);
  expect(errors).toEqual([]);
});
