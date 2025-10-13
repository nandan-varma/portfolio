import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Footer from '../../src/components/Footer.astro';

test('Footer renders correctly with current year', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Footer);

  const currentYear = new Date().getFullYear().toString();
  expect(result).toContain(`&copy; ${currentYear} Your name here. All rights reserved.`);
  expect(result).toContain('social-links');
});