import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import NotFound from '../../src/pages/404.astro';

test('404 page renders correctly', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(NotFound, {
    request: new Request('https://www.nandanvarma.com/nonexistent'),
  });

  expect(result).toContain('Error 404');
  expect(result).toContain('Page not found');
  expect(result).toContain('href="/"');
  expect(result).toContain('Main Menu');
  expect(result).toContain('href="/contact"');
  expect(result).toContain('Contact');
  expect(result).toContain('<canvas id="canvas"');
});