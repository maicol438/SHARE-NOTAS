import '@testing-library/jest-dom';
import { vi } from 'vitest';

if (typeof globalThis.ProgressEvent !== 'function') {
  class ProgressEventPolyfill extends Event {
    lengthComputable: boolean;
    loaded: number;
    total: number;

    constructor(type: string, init: Record<string, unknown> = {}) {
      super(type, init as EventInit);
      this.lengthComputable = (init.lengthComputable as boolean) || false;
      this.loaded = (init.loaded as number) || 0;
      this.total = (init.total as number) || 0;
    }
  }
  globalThis.ProgressEvent = ProgressEventPolyfill as unknown as typeof ProgressEvent;
  if (typeof window !== 'undefined') (window as unknown as Record<string, unknown>).ProgressEvent = ProgressEventPolyfill;
}

vi.mock('react-hot-toast', () => ({
  default: {
    custom: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => null,
}));

const noop = (): void => {};
vi.mock('./components/ui/NeuralBackground', () => ({ default: () => null }));
vi.mock('../components/ui/NeuralBackground', () => ({ default: () => null }));

HTMLCanvasElement.prototype.getContext = (() => ({
  fillRect: noop, clearRect: noop, getImageData: () => ({ data: [] }),
  putImageData: noop, createImageData: () => [], setTransform: noop,
  drawImage: noop, save: noop, fillText: noop, restore: noop,
  beginPath: noop, moveTo: noop, lineTo: noop, closePath: noop,
  stroke: noop, translate: noop, scale: noop, rotate: noop,
  arc: noop, fill: noop, measureText: () => ({ width: 0 }),
  transform: noop, rect: noop, clip: noop,
  createLinearGradient: () => ({ addColorStop: noop }),
  createRadialGradient: () => ({ addColorStop: noop }),
  transferFromImageBitmap: noop,
})) as unknown as HTMLCanvasElement['getContext'];

document.execCommand = vi.fn() as unknown as typeof document.execCommand;

Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
});

delete (globalThis as Record<string, unknown>).XMLHttpRequest;

const origConsoleError: (...args: unknown[]) => void = console.error;
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && (args[0] as string).includes('Not implemented: HTMLCanvasElement')) return;
  origConsoleError.call(console, ...args);
};
