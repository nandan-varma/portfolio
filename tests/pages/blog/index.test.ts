import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, vi } from 'vitest';
import BlogIndex from '../../../src/pages/blog/index.astro';

// Mock getCollection
vi.mock('astro:content', () => ({
  getCollection: vi.fn(() => Promise.resolve([
    {
      id: 'test-post-1',
      data: {
        title: 'Test Post 1',
        description: 'Description 1',
        date: '2023-10-15',
        draft: false
      }
    },
    {
      id: 'test-post-2',
      data: {
        title: 'Test Post 2',
        description: 'Description 2',
        date: '2023-10-14',
        draft: false
      }
    },
    {
      id: 'draft-post',
      data: {
        title: 'Draft Post',
        description: 'Draft description',
        date: '2023-10-13',
        draft: true
      }
    }
  ]))
}));

test('Blog index page renders correctly with blog posts', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(BlogIndex, {
    request: new Request('https://www.nandanvarma.com/blog'),
  });

  expect(result).toContain('Blog');
  expect(result).toContain('Test Post 1');
  expect(result).toContain('Test Post 2');
  expect(result).not.toContain('Draft Post'); // Drafts should be filtered out
  expect(result).toContain('og:image');
  expect(result).toContain('https://www.nandanvarma.com/og/blog.png');
});

test('Blog index page sorts posts by date descending', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(BlogIndex, {
    request: new Request('https://www.nandanvarma.com/blog'),
  });

  // Test Post 1 (2023-10-15) should appear before Test Post 2 (2023-10-14)
  const post1Index = result.indexOf('Test Post 1');
  const post2Index = result.indexOf('Test Post 2');
  expect(post1Index).toBeLessThan(post2Index);
});

test('Blog index page handles posts with missing dates', async () => {
  // Mock getCollection to return posts with missing dates
  const { getCollection } = await import('astro:content');
  getCollection.mockResolvedValueOnce([
    {
      id: 'post-with-date',
      data: {
        title: 'Post With Date',
        description: 'Has date',
        date: '2023-10-15',
        draft: false
      }
    },
    {
      id: 'post-without-date',
      data: {
        title: 'Post Without Date',
        description: 'No date',
        draft: false
        // date is missing
      }
    },
    {
      id: 'another-post-with-date',
      data: {
        title: 'Another Post With Date',
        description: 'Also has date',
        date: '2023-10-14',
        draft: false
      }
    }
  ]);

  const container = await AstroContainer.create();
  const result = await container.renderToString(BlogIndex, {
    request: new Request('https://www.nandanvarma.com/blog'),
  });

  // Should render all posts
  expect(result).toContain('Post With Date');
  expect(result).toContain('Post Without Date');
  expect(result).toContain('Another Post With Date');

  // Posts with dates should be sorted properly
  const datedPostIndex = result.indexOf('Post With Date');
  const anotherDatedPostIndex = result.indexOf('Another Post With Date');
  expect(datedPostIndex).toBeLessThan(anotherDatedPostIndex);
});