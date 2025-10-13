import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import ProjectPost from '../../src/layouts/ProjectPost.astro';

test('ProjectPost renders title, description and navigation', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ProjectPost, {
    props: {
      title: 'Test Project',
      description: 'This is a test project description',
      repository: 'nandan-varma/test-repo',
      url: 'https://testproject.com'
    },
    slots: {
      default: '<article><p>Test content</p></article>'
    }
  });

  expect(result).toContain('Test Project');
  expect(result).toContain('This is a test project description');
  expect(result).toContain('<article><p>Test content</p></article>');
  expect(result).toContain('href="/projects"');
  expect(result).toContain('href="https://github.com/nandan-varma"');
});

test('ProjectPost renders GitHub link when repository is provided', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ProjectPost, {
    props: {
      title: 'Test Project',
      description: 'Description',
      repository: 'nandan-varma/test-repo',
      url: null
    }
  });

  expect(result).toContain('href="https://github.com/nandan-varma/test-repo"');
  expect(result).toContain('GitHub');
});

test('ProjectPost renders website link when url is provided', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ProjectPost, {
    props: {
      title: 'Test Project',
      description: 'Description',
      repository: null,
      url: 'https://testproject.com'
    }
  });

  expect(result).toContain('href="https://testproject.com"');
  expect(result).toContain('Website');
});

test('ProjectPost renders both links when repository and url are provided', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ProjectPost, {
    props: {
      title: 'Test Project',
      description: 'Description',
      repository: 'nandan-varma/test-repo',
      url: 'https://testproject.com'
    }
  });

  expect(result).toContain('href="https://github.com/nandan-varma/test-repo"');
  expect(result).toContain('href="https://testproject.com"');
  expect(result).toContain('GitHub');
  expect(result).toContain('Website');
});

test('ProjectPost does not render links when neither repository nor url are provided', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ProjectPost, {
    props: {
      title: 'Test Project',
      description: 'Description',
      repository: null,
      url: null
    }
  });

  expect(result).not.toContain('GitHub');
  expect(result).not.toContain('Website');
});