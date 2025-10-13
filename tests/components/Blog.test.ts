import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Blog from '../../src/components/Blog.astro';

test('Blog renders correctly with blog data', async () => {
  const container = await AstroContainer.create();
  const mockBlog = {
    title: 'Test Blog',
    description: 'Test Description',
    date: '2023-10-15'
  };
  const result = await container.renderToString(Blog, {
    props: {
      id: 'test-id',
      blog: mockBlog,
      views: 100
    }
  });

  expect(result).toContain('href="/blog/test-id"');
  expect(result).toContain('Test Blog');
  expect(result).toContain('Test Description');
  expect(result).toContain('2023');
});