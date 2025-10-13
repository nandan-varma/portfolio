import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import ProjectCard from '../../src/components/ProjectCard.astro';

test('ProjectCard renders correctly with slots', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ProjectCard, {
    slots: {
      default: '<h2>Test Content</h2>'
    }
  });

  expect(result).toContain('<div');
  expect(result).toContain('data-card');
  expect(result).toContain('<h2>Test Content</h2>');
});