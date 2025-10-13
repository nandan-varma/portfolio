import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Index from '../../src/pages/index.astro';

test('Index page renders correctly', async () => {
  const container = await AstroContainer.create({
    site: 'https://www.nandanvarma.com',
  });
  const result = await container.renderToString(Index, {
    request: new Request('https://www.nandanvarma.com/'),
  });

  expect(result).toContain('Nandan Varma');
  expect(result).toContain('href="/projects"');
  expect(result).toContain('href="/blog"');
  expect(result).toContain('href="/contact"');
});