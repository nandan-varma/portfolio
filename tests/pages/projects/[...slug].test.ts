import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, vi } from 'vitest';
import ProjectPost from '../../../src/pages/projects/[...slug].astro';

// Mock astro:content
vi.mock('astro:content', () => ({
  getCollection: vi.fn(() => Promise.resolve([
    {
      id: 'test-project',
      data: {
        title: 'Test Project',
        description: 'Test description',
        repository: 'nandan-varma/test-repo',
        url: 'https://testproject.com',
        date: '2023-10-15'
      }
    }
  ])),
  render: vi.fn(() => Promise.resolve({
    Content: vi.fn(() => '<p>Test project content</p>')
  }))
}));

test.skip('Project post page renders correctly', async () => {
  const container = await AstroContainer.create();
  const mockProject = {
    id: 'test-project',
    data: {
      title: 'Test Project',
      description: 'Test description',
      repository: 'nandan-varma/test-repo',
      url: 'https://testproject.com',
      date: '2023-10-15'
    }
  };

  const result = await container.renderToString(ProjectPost, {
    props: mockProject,
    params: { slug: 'test-project' },
    request: new Request('https://www.nandanvarma.com/projects/test-project'),
  });

  expect(result).toContain('Test Project');
  expect(result).toContain('Test description');
  expect(result).toContain('<p>Test project content</p>');
  expect(result).toContain('image="/og/project/test-project.png"');
});

test('getStaticPaths generates correct paths for projects', async () => {
  // Import the function directly to test it
  const { getStaticPaths } = await import('../../../src/pages/projects/[...slug].astro');

  const paths = await getStaticPaths();

  expect(paths).toHaveLength(1);
  expect(paths[0]).toEqual({
    params: { slug: 'test-project' },
    props: {
      id: 'test-project',
      data: {
        title: 'Test Project',
        description: 'Test description',
        repository: 'nandan-varma/test-repo',
        url: 'https://testproject.com',
        date: '2023-10-15'
      }
    }
  });
});