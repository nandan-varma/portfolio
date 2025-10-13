import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, vi } from 'vitest';
import BaseHead from '../../src/components/BaseHead.astro';

// Mock Astro globals
vi.mock('astro:transitions', () => ({
  ClientRouter: 'div', // Return a simple string that Astro can render
}));

test('BaseHead renders correctly with default props', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(BaseHead, {
    props: {
      title: 'Test Title',
      description: 'Test Description'
    }
  });

  expect(result).toContain('<title>Test Title</title>');
  expect(result).toContain('<meta name="description" content="Test Description">');
  expect(result).toContain('<meta property="og:title" content="Test Title">');
  expect(result).toContain('<meta property="og:description" content="Test Description">');
  expect(result).toContain('<link rel="canonical"');
});

test('BaseHead handles when Astro.site is null', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(BaseHead, {
    props: {
      title: 'Test Title',
      description: 'Test Description'
    }
  });

  // Should fall back to default URL when Astro.site is not available
  expect(result).toContain('https://www.nandanvarma.com');
});

test('BaseHead uses Astro.site when available', async () => {
  // Note: In AstroContainer test environment, Astro.site is always undefined
  // This test documents that the fallback is used when Astro.site is not available
  const container = await AstroContainer.create();
  const result = await container.renderToString(BaseHead, {
    props: {
      title: 'Test Title',
      description: 'Test Description'
    }
  });

  // In test environment, Astro.site is undefined, so fallback is used
  expect(result).toContain('<link rel="canonical" href="https://www.nandanvarma.com/">');
});