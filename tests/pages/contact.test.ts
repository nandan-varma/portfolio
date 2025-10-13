import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Contact from '../../src/pages/contact.astro';

test('Contact page renders correctly', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Contact, {
    request: new Request('https://www.nandanvarma.com/contact'),
  });

  expect(result).toContain('Contact');
  expect(result).toContain('contact@nandan.fyi');
  expect(result).toContain('href="mailto:contact@nandan.fyi"');
  expect(result).toContain('nandan-varma');
  expect(result).toContain('href="https://github.com/nandan-varma"');
  expect(result).toContain('nandanvarma');
  expect(result).toContain('href="https://www.linkedin.com/in/nandanvarma/"');
});

test('Contact page includes proper meta tags', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Contact, {
    request: new Request('https://www.nandanvarma.com/contact'),
  });

  expect(result).toContain('og:image');
  expect(result).toContain('https://www.nandanvarma.com/og/contact.png');
});