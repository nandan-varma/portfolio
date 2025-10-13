import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import HeaderLink from '../../src/components/HeaderLink.astro';

test('HeaderLink renders correctly', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(HeaderLink, {
    props: {
      href: '/test',
      className: 'test-class'
    },
    slots: {
      default: 'Test Link'
    }
  });

  expect(result).toContain('<a');
  expect(result).toContain('href="/test"');
  expect(result).toContain('Test Link');
});