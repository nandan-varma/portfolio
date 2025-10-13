import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Article from '../../src/components/Article.astro';

test('Article renders correctly with project data', async () => {
  const container = await AstroContainer.create();
  const mockProject = {
    title: 'Test Project',
    description: 'Test Description',
    date: '2023-10-15'
  };
  const result = await container.renderToString(Article, {
    props: {
      id: 'test-id',
      project: mockProject,
      views: 100
    }
  });

  expect(result).toContain('href="/projects/test-id"');
  expect(result).toContain('Test Project');
  expect(result).toContain('Test Description');
  expect(result).toContain('2023');
});

test('Article handles project without date', async () => {
  const container = await AstroContainer.create();
  const mockProject = {
    title: 'Test Project',
    description: 'Test Description'
  };
  const result = await container.renderToString(Article, {
    props: {
      id: 'test-id',
      project: mockProject,
      views: 100
    }
  });

  expect(result).toContain('SOON');
});