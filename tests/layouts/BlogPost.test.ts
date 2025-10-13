import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import BlogPost from '../../src/layouts/BlogPost.astro';

test('BlogPost renders title and description', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(BlogPost, {
    props: {
      title: 'Test Blog Post',
      description: 'This is a test blog post description',
      draft: false
    },
    slots: {
      default: '<article><p>Test content</p></article>'
    }
  });

  expect(result).toContain('Test Blog Post');
  expect(result).toContain('This is a test blog post description');
  expect(result).toContain('<article><p>Test content</p></article>');
  expect(result).toContain('href="/blog"');
  expect(result).toContain('href="https://github.com/nandan-varma"');
});

test('BlogPost shows draft warning when draft is true', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(BlogPost, {
    props: {
      title: 'Draft Post',
      description: 'Draft description',
      draft: true
    }
  });

  expect(result).toContain('This post is a draft and may not be complete.');
});

test('BlogPost does not show draft warning when draft is false', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(BlogPost, {
    props: {
      title: 'Published Post',
      description: 'Published description',
      draft: false
    }
  });

  expect(result).not.toContain('This post is a draft');
});