import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import FormattedDate from '../../src/components/FormattedDate.astro';

test('FormattedDate renders correctly with valid date', async () => {
  const container = await AstroContainer.create();
  const testDate = new Date('2023-10-15');
  const result = await container.renderToString(FormattedDate, {
    props: {
      date: testDate
    }
  });

  expect(result).toContain('datetime="2023-10-15T00:00:00.000Z"');
  expect(result).toContain('Oct');
});

test('FormattedDate handles different date formats', async () => {
  const container = await AstroContainer.create();
  const testDate = new Date(2023, 9, 15); // Month is 0-based
  const result = await container.renderToString(FormattedDate, {
    props: {
      date: testDate
    }
  });

  expect(result).toContain('datetime="2023-10-15T');
  expect(result).toContain('Oct 15, 2023');
});