import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, vi } from 'vitest';
import BlogPost from '../../../src/pages/blog/[...slug].astro';

// Mock astro:content
vi.mock('astro:content', () => ({
  getCollection: vi.fn(() => Promise.resolve([
    {
      id: 'test-blog-post',
      data: {
        title: 'Test Blog Post',
        description: 'Blog post description',
        date: '2023-10-15'
      }
    }
  ])),
  render: vi.fn(() => Promise.resolve({
    Content: vi.fn(() => '<p>Test content</p>')
  }))
}));

test.skip('Blog post page renders correctly', async () => {
  const container = await AstroContainer.create();
  const mockPost = {
    id: 'test-blog-post',
    data: {
      title: 'Test Blog Post',
      description: 'Blog post description',
      date: '2023-10-15',
      draft: false
    }
  };

  const result = await container.renderToString(BlogPost, {
    props: mockPost,
    params: { slug: 'test-blog-post' },
    request: new Request('https://www.nandanvarma.com/blog/test-blog-post'),
  });

  expect(result).toContain('Test Blog Post');
  expect(result).toContain('Blog post description');
  expect(result).toContain('<p>Test content</p>');
  expect(result).toContain('image="/og/blog/test-blog-post.png"');
});

test('getStaticPaths generates correct paths', async () => {
  // Import the function directly to test it
  const { getStaticPaths } = await import('../../../src/pages/blog/[...slug].astro');

  const paths = await getStaticPaths();

  expect(paths).toHaveLength(1);
  expect(paths[0]).toEqual({
    params: { slug: 'test-blog-post' },
    props: {
      data: {
        title: 'Test Blog Post',
        description: 'Blog post description',
        date: '2023-10-15'
      },
      id: 'test-blog-post'
    }
  });
});