import type { InternalAxiosRequestConfig } from 'axios';

interface AxiosWithHandlers {
  defaults: {
    withCredentials: boolean;
    headers: Record<string, string>;
  };
  interceptors: {
    request: {
      handlers: Array<{
        fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
        rejected?: (error: unknown) => unknown;
      }>;
    };
    response: {
      handlers: Array<{
        fulfilled: (response: unknown) => unknown;
        rejected: (error: { response?: { status?: number; data?: { message?: string } } }) => unknown;
      }>;
    };
  };
}

describe('Axios Configuration', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('Debe tener withCredentials: true', async () => {
    const api = (await import('../api/axios')).default;
    expect(api.defaults.withCredentials).toBe(true);
  });

  it('Debe tener Content-Type application/json', async () => {
    const api = (await import('../api/axios')).default;
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('Debe eliminar Content-Type para FormData', async () => {
    const api = vi.mocked((await import('../api/axios')).default as unknown as AxiosWithHandlers);
    const config = { data: new FormData(), headers: { 'Content-Type': 'application/json' } } as InternalAxiosRequestConfig;
    const intercepted = api.interceptors.request.handlers[0].fulfilled(config);
    expect(intercepted.headers['Content-Type']).toBeUndefined();
  });

  it('Debe llamar logoutCallback en respuesta 401', async () => {
    const axiosModule = await import('../api/axios');
    const api = vi.mocked(axiosModule.default as unknown as AxiosWithHandlers);
    const callback = vi.fn();
    axiosModule.onUnauthorized(callback);

    const error = { response: { status: 401 } };
    await expect(api.interceptors.response.handlers[0].rejected(error)).rejects.toThrow();
    expect(callback).toHaveBeenCalled();
  });

  it('Debe llamar forbiddenCallback en respuesta 403', async () => {
    const axiosModule = await import('../api/axios');
    const api = vi.mocked(axiosModule.default as unknown as AxiosWithHandlers);
    const callback = vi.fn();
    axiosModule.onForbidden(callback);

    const error = { response: { status: 403, data: { message: 'Acceso denegado' } } };
    await expect(api.interceptors.response.handlers[0].rejected(error)).rejects.toThrow();
    expect(callback).toHaveBeenCalled();
  });

  it('Debe rechazar con error de conexión si no hay respuesta', async () => {
    const api = vi.mocked((await import('../api/axios')).default as unknown as AxiosWithHandlers);
    const error = { response: undefined };
    await expect(api.interceptors.response.handlers[0].rejected(error)).rejects.toThrow(
      'No se pudo conectar al servidor'
    );
  });
});
