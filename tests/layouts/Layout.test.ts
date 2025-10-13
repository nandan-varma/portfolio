import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Layout from '../../src/layouts/Layout.astro';

test('Layout renders slot content and includes required elements', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Layout, {
    slots: {
      default: '<main><h1>Test Content</h1></main>'
    }
  });

  expect(result).toContain('<html lang="en">');
  expect(result).toContain('<main><h1>Test Content</h1></main>');
  expect(result).toContain('href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Parkinsans:wght@300..800&display=swap"');
  expect(result).toContain('rel="sitemap"');
});