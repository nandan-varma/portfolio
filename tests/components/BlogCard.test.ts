import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import BlogCard from '../../src/components/BlogCard.astro';

test('BlogCard renders correctly with slots', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(BlogCard, {
    slots: {
      default: '<h2>Test Content</h2>'
    }
  });

  expect(result).toContain('<div');
  expect(result).toContain('data-card');
  expect(result).toContain('<h2>Test Content</h2>');
});