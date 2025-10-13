import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Navigation from '../../src/components/Navigation.astro';

test('Navigation renders correctly', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Navigation);

  expect(result).toContain('Projects');
  expect(result).toContain('href="/projects"');
  expect(result).toContain('Contact');
  expect(result).toContain('href="/contact"');
  expect(result).toContain('href="/"');
});