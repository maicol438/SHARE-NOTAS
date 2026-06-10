import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from '../hooks/useDarkMode';

interface MockMediaQueryList {
  matches: boolean;
  media: string;
  onchange: null;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
}

describe('useDarkMode Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    window.matchMedia = vi.fn().mockImplementation((query: string): MockMediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('Debe inicializar con valor por defecto (light)', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDark).toBe(false);
  });

  it('Debe leer el tema guardado en localStorage', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDark).toBe(true);
  });

  it('Debe alternar el tema con toggle', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDark).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.isDark).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.isDark).toBe(false);
  });

  it('Debe actualizar la clase dark en el documento al alternar', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => result.current.toggle());
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => result.current.toggle());
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('Debe guardar el tema en localStorage al alternar', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => result.current.toggle());
    expect(localStorage.getItem('theme')).toBe('dark');

    act(() => result.current.toggle());
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('Debe detectar preferencia del sistema cuando no hay tema guardado', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string): MockMediaQueryList => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDark).toBe(true);
  });
});
