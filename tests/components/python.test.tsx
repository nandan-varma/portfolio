/**
 * @vitest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { PythonEditor } from '../../src/components/python.tsx';

// Mock Pyodide to prevent loading real assets
vi.mock('pyodide', () => ({
  loadPyodide: vi.fn().mockResolvedValue({
    runPython: vi.fn().mockReturnValue('mock output'),
  }),
}));

test('PythonEditor renders correctly', async () => {
  await act(async () => {
    render(<PythonEditor />);
  });

  expect(screen.getByText('Python Code Runner')).toBeInTheDocument();
  expect(screen.getByText('Run')).toBeInTheDocument();
  expect(screen.getByText('Clear')).toBeInTheDocument();
  expect(screen.getByText('Reset')).toBeInTheDocument();
});