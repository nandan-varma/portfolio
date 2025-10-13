import { expect, test, vi } from 'vitest';

// Mock astro:content
vi.mock('astro:content', () => ({
  getCollection: vi.fn((type: string) => {
    if (type === 'blog') {
      return Promise.resolve([
        {
          id: 'test-blog-post',
          data: {
            title: 'Test Blog Post',
            description: 'Blog post description',
            date: '2023-10-15'
          }
        }
      ]);
    } else if (type === 'project') {
      return Promise.resolve([
        {
          id: 'test-project',
          data: {
            title: 'Test Project',
            description: 'Project description',
            date: '2023-10-15'
          }
        }
      ]);
    }
    return Promise.resolve([]);
  })
}));

// Mock astro-og-canvas
vi.mock('astro-og-canvas', () => ({
  OGImageRoute: vi.fn((config) => {
    const pages = config.pages;
    return {
      getStaticPaths: async () => {
        return Object.keys(pages).map(route => ({
          params: { route },
          props: { page: pages[route] }
        }));
      },
      GET: vi.fn()
    };
  })
}));

test('OG route getStaticPaths generates correct paths', async () => {
  const { getStaticPaths } = await import('../../../src/pages/og/[...route].ts');

  const paths = await getStaticPaths();

  // Should include main pages + blog + project pages
  const routeParams = paths.map(p => p.params.route);

  expect(routeParams).toContain('index');
  expect(routeParams).toContain('contact');
  expect(routeParams).toContain('projects');
  expect(routeParams).toContain('blog');
  expect(routeParams).toContain('blog/test-blog-post');
  expect(routeParams).toContain('project/test-project');

  // Check that blog post has correct data
  const blogPath = paths.find(p => p.params.route === 'blog/test-blog-post');
  expect(blogPath?.props.page.title).toBe('Test Blog Post');
  expect(blogPath?.props.page.type).toBe('blog');

  // Check that project has correct data
  const projectPath = paths.find(p => p.params.route === 'project/test-project');
  expect(projectPath?.props.page.title).toBe('Test Project');
  expect(projectPath?.props.page.type).toBe('project');
});

test('OG route getImageOptions returns correct options for index page', async () => {
  // Import the module to trigger the getImageOptions function
  await import('../../../src/pages/og/[...route].ts');

  // Get the mocked OGImageRoute
  const { OGImageRoute } = await import('astro-og-canvas');
  const mockOGImageRoute = OGImageRoute.mock.calls[0][0];

  // Test getImageOptions for index page
  const indexPage = {
    title: 'Nandan Varma',
    description: 'A Software Developer passionate about building amazing things',
    type: 'page'
  };

  const imageOptions = mockOGImageRoute.getImageOptions('index', indexPage);

  expect(imageOptions.title).toBe('Nandan Varma');
  expect(imageOptions.description).toBe('A Software Developer passionate about building amazing things');
  expect(imageOptions.logo.path).toBe('./public/favicon.png');
  expect(imageOptions.logo.size).toEqual([80, 80]);
  expect(imageOptions.bgGradient).toEqual([
    [255, 255, 255],
    [200, 200, 200],
    [150, 150, 150],
  ]);
  expect(imageOptions.border.color).toEqual([255, 255, 255]);
  expect(imageOptions.border.width).toBe(2);
  expect(imageOptions.border.side).toBe('inline-start');
  expect(imageOptions.font.title.color).toEqual([0, 0, 0]);
  expect(imageOptions.font.title.size).toBe(80);
  expect(imageOptions.font.title.weight).toBe('ExtraBold');
  expect(imageOptions.font.description.color).toEqual([0, 0, 0]);
  expect(imageOptions.font.description.size).toBe(48);
  expect(imageOptions.font.description.weight).toBe('Normal');
  expect(imageOptions.padding).toBe(80);
});

test('OG route getImageOptions returns correct options for blog post', async () => {
  // Import the module to trigger the getImageOptions function
  await import('../../../src/pages/og/[...route].ts');

  // Get the mocked OGImageRoute
  const { OGImageRoute } = await import('astro-og-canvas');
  const mockOGImageRoute = OGImageRoute.mock.calls[0][0];

  // Test getImageOptions for blog post
  const blogPage = {
    title: 'Test Blog Post',
    description: 'Blog post description',
    date: '2023-10-15',
    type: 'blog'
  };

  const imageOptions = mockOGImageRoute.getImageOptions('blog/test-blog-post', blogPage);

  expect(imageOptions.title).toBe('Test Blog Post');
  expect(imageOptions.description).toBe('Blog post description');
  expect(imageOptions.logo.path).toBe('./public/favicon.png');
  expect(imageOptions.logo.size).toEqual([80, 80]);
  expect(imageOptions.bgGradient).toEqual([
    [255, 255, 255],
    [200, 200, 200],
    [150, 150, 150],
  ]);
  expect(imageOptions.border.color).toEqual([255, 255, 255]);
  expect(imageOptions.border.width).toBe(2);
  expect(imageOptions.border.side).toBe('inline-start');
  expect(imageOptions.font.title.color).toEqual([0, 0, 0]);
  expect(imageOptions.font.title.size).toBe(80);
  expect(imageOptions.font.title.weight).toBe('ExtraBold');
  expect(imageOptions.font.description.color).toEqual([0, 0, 0]);
  expect(imageOptions.font.description.size).toBe(48);
  expect(imageOptions.font.description.weight).toBe('Normal');
  expect(imageOptions.padding).toBe(80);
});

test('OG route getImageOptions returns correct options for project', async () => {
  // Import the module to trigger the getImageOptions function
  await import('../../../src/pages/og/[...route].ts');

  // Get the mocked OGImageRoute
  const { OGImageRoute } = await import('astro-og-canvas');
  const mockOGImageRoute = OGImageRoute.mock.calls[0][0];

  // Test getImageOptions for project
  const projectPage = {
    title: 'Test Project',
    description: 'Project description',
    date: '2023-10-15',
    type: 'project'
  };

  const imageOptions = mockOGImageRoute.getImageOptions('project/test-project', projectPage);

  expect(imageOptions.title).toBe('Test Project');
  expect(imageOptions.description).toBe('Project description');
  expect(imageOptions.logo.path).toBe('./public/favicon.png');
  expect(imageOptions.logo.size).toEqual([80, 80]);
  expect(imageOptions.bgGradient).toEqual([
    [255, 255, 255],
    [200, 200, 200],
    [150, 150, 150],
  ]);
  expect(imageOptions.border.color).toEqual([255, 255, 255]);
  expect(imageOptions.border.width).toBe(2);
  expect(imageOptions.border.side).toBe('inline-start');
  expect(imageOptions.font.title.color).toEqual([0, 0, 0]);
  expect(imageOptions.font.title.size).toBe(80);
  expect(imageOptions.font.title.weight).toBe('ExtraBold');
  expect(imageOptions.font.description.color).toEqual([0, 0, 0]);
  expect(imageOptions.font.description.size).toBe(48);
  expect(imageOptions.font.description.weight).toBe('Normal');
  expect(imageOptions.padding).toBe(80);
});

test('OG route GET handler is properly configured', async () => {
  const { GET } = await import('../../../src/pages/og/[...route].ts');

  // The GET handler should be the one returned by OGImageRoute
  expect(GET).toBeDefined();
  expect(typeof GET).toBe('function');
});