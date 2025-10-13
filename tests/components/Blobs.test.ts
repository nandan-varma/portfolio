import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Blobs from '../../src/components/Blobs.astro';

test('Blobs renders without content', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Blobs);

  expect(result).toBe(''); // Empty component
});