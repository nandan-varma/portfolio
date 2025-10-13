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

test('HeaderLink handles root pathname without subpath', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(HeaderLink, {
    request: new Request('http://localhost/'),
    props: {
      href: '/',
      className: 'home-link'
    },
    slots: {
      default: 'Home'
    }
  });

  expect(result).toContain('<a');
  expect(result).toContain('href="/"');
  expect(result).toContain('Home');
});

test('HeaderLink handles subpath matching', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(HeaderLink, {
    request: new Request('http://localhost/blog/post'),
    props: {
      href: '/blog',
      className: 'blog-link'
    },
    slots: {
      default: 'Blog'
    }
  });

  expect(result).toContain('<a');
  expect(result).toContain('href="/blog"');
  expect(result).toContain('Blog');
});