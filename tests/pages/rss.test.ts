import { expect, test, vi } from 'vitest';

// Mock astro:content
vi.mock('astro:content', () => ({
  getCollection: vi.fn(() => Promise.resolve([
    {
      id: 'test-project',
      data: {
        title: 'Test Project',
        description: 'Test description',
        date: new Date('2023-10-15'),
        repository: 'nandan-varma/test-repo',
        url: 'https://testproject.com'
      }
    }
  ]))
}));

// Mock @astrojs/rss
vi.mock('@astrojs/rss', () => ({
  default: vi.fn((config) => ({
    body: `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${config.title}</title>
    <description>${config.description}</description>
    <link>${config.site}</link>
    ${config.items.map(item => `
    <item>
      <title>${item.title}</title>
      <description>${item.description}</description>
      <link>${config.site}${item.link}</link>
      <pubDate>${item.date?.toUTCString()}</pubDate>
    </item>`).join('')}
  </channel>
</rss>`.trim()
  }))
}));

// Mock consts
vi.mock('../../src/consts', () => ({
  SITE_TITLE: 'Test Site',
  SITE_DESCRIPTION: 'Test Description'
}));

test('RSS endpoint generates correct RSS feed', async () => {
  const { GET } = await import('../../src/pages/rss.xml.js');

  const mockContext = {
    site: 'https://www.nandanvarma.com'
  };

  const response = await GET(mockContext);

  expect(response.body).toContain('<title>Test Site</title>');
  expect(response.body).toContain('<description>Test Description</description>');
  expect(response.body).toContain('<link>https://www.nandanvarma.com</link>');
  expect(response.body).toContain('<title>Test Project</title>');
  expect(response.body).toContain('<link>https://www.nandanvarma.com/projects/test-project/</link>');
});