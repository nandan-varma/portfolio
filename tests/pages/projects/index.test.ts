import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, vi } from 'vitest';
import ProjectsIndex from '../../../src/pages/projects/index.astro';

// Mock getCollection
vi.mock('astro:content', () => ({
  getCollection: vi.fn(() => Promise.resolve([
    {
      id: 'replog',
      data: {
        title: 'Replog',
        description: 'A fitness tracking app',
        date: '2023-10-15'
      }
    },
    {
      id: 'friday',
      data: {
        title: 'Friday',
        description: 'AI assistant app',
        date: '2023-10-14'
      }
    },
    {
      id: 'productivity',
      data: {
        title: 'Productivity',
        description: 'Productivity tools',
        date: '2023-10-13'
      }
    },
    {
      id: 'other-project',
      data: {
        title: 'Other Project',
        description: 'Another project',
        date: '2023-10-12'
      }
    }
  ]))
}));

test('Projects index page renders correctly with projects', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ProjectsIndex, {
    request: new Request('https://www.nandanvarma.com/projects'),
  });

  expect(result).toContain('Projects');
  expect(result).toContain('Replog'); // Featured project
  expect(result).toContain('Friday'); // Top 2
  expect(result).toContain('Productivity'); // Top 3
  expect(result).toContain('Other Project'); // In grid
  expect(result).toContain('og:image');
  expect(result).toContain('https://www.nandanvarma.com/og/projects.png');
});

test('Projects index page features correct projects', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ProjectsIndex, {
    request: new Request('https://www.nandanvarma.com/projects'),
  });

  // Check that Replog appears in featured section
  expect(result).toContain('href="/projects/replog"');
});

test('Projects index page handles projects with missing dates', async () => {
  // Mock getCollection to return projects with missing dates
  const { getCollection } = await import('astro:content');
  getCollection.mockResolvedValueOnce([
    {
      id: 'project-with-date',
      data: {
        title: 'Project With Date',
        description: 'Has date',
        date: '2023-10-15'
      }
    },
    {
      id: 'project-without-date',
      data: {
        title: 'Project Without Date',
        description: 'No date'
        // date is missing
      }
    },
    {
      id: 'another-project-with-date',
      data: {
        title: 'Another Project With Date',
        description: 'Also has date',
        date: '2023-10-14'
      }
    }
  ]);

  const container = await AstroContainer.create();
  const result = await container.renderToString(ProjectsIndex, {
    request: new Request('https://www.nandanvarma.com/projects'),
  });

  // Should render all projects
  expect(result).toContain('Project With Date');
  expect(result).toContain('Project Without Date');
  expect(result).toContain('Another Project With Date');
});