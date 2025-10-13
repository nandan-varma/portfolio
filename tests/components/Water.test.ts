import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, vi } from 'vitest';
import Water from '../../src/components/Water.astro';

// Mock canvas and related APIs
const mockGetContext = vi.fn(() => ({
  fillStyle: '',
  fillRect: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 })),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  beginPath: vi.fn(),
  arc: vi.fn(),
  ellipse: vi.fn(),
  stroke: vi.fn(),
  clearRect: vi.fn(),
  shadowColor: '',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
}));

const mockCanvas = {
  width: 800,
  height: 600,
  getContext: mockGetContext,
  getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0 })),
};

vi.stubGlobal('HTMLCanvasElement', class {
  getContext = mockGetContext;
  getBoundingClientRect = mockCanvas.getBoundingClientRect;
});

vi.stubGlobal('document', {
  ...global.document,
  getElementById: vi.fn(() => mockCanvas),
  addEventListener: vi.fn(),
});

test('Water renders canvas element', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Water);

  expect(result).toContain('<canvas id="waterCanvas"');
  expect(result).toContain('aria-label="Nandan Varma"');
});