import { describe, expect, it } from 'vitest';
import { cn } from '../../src/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
  });

  it('should handle clsx inputs', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
  });

  it('should handle tailwind merge conflicts', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should return empty string for no inputs', () => {
    expect(cn()).toBe('');
  });

  it('should handle undefined and null values', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
  });

  it('should merge complex tailwind classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle nested arrays', () => {
    expect(cn(['class1', ['class2', 'class3']])).toBe('class1 class2 class3');
  });
});