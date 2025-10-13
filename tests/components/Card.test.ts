import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Card from '../../src/components/Card.astro';

test('Card renders correctly', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Card, {
    props: {
      className: 'test-class'
    }
  });

  expect(result).toContain('<div');
  expect(result).toContain('data-slot="card"');
  expect(result).toContain('test-class');
});