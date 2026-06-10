import useAuthStore from '../stores/useAuthStore';

interface MockUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface LoginResult {
  ok: boolean;
  user?: MockUser;
  message?: string;
}

const mockUser: MockUser = { _id: 'user1', name: 'Maicol', email: 'maicol@ejemplo.com', role: 'user' };

vi.mock('../api/axios', () => {
  const mockAxios = {
    defaults: { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
    interceptors: {
      request: { handlers: [] as unknown[] },
      response: { handlers: [] as unknown[] },
    },
    post: vi.fn(),
    get: vi.fn(),
  };
  return { default: mockAxios, onUnauthorized: vi.fn(), onForbidden: vi.fn(), API_BASE: '' };
});

describe('useAuthStore (Zustand)', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isCheckingAuth: true,
    });
  });

  it('Debe tener estado inicial correcto', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.isCheckingAuth).toBe(true);
  });

  it('Debe actualizar el usuario con setUser', () => {
    useAuthStore.getState().setUser(mockUser);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('Debe establecer isAuthenticated=false cuando setUser recibe null', () => {
    useAuthStore.getState().setUser(null);
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('Debe manejar login exitoso', async () => {
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.post.mockResolvedValueOnce({ data: { user: mockUser } });

    const result = await useAuthStore.getState().login({ email: 'maicol@ejemplo.com', password: 'password123' }) as LoginResult;

    expect(result.ok).toBe(true);
    expect(result.user).toEqual(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('Debe manejar login fallido con error del servidor', async () => {
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Credenciales inválidas' } },
    });

    const result = await useAuthStore.getState().login({ email: 'maicol@ejemplo.com', password: 'wrong' }) as LoginResult;

    expect(result.ok).toBe(false);
    expect(result.message).toBe('Credenciales inválidas');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('Debe manejar login fallido sin mensaje del servidor', async () => {
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.post.mockRejectedValueOnce({ response: {} });

    const result = await useAuthStore.getState().login({ email: 'test@test.com', password: 'wrong' }) as LoginResult;

    expect(result.ok).toBe(false);
    expect(result.message).toBe('Credenciales incorrectas');
  });

  it('Debe manejar registro exitoso', async () => {
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.post.mockResolvedValueOnce({ data: { user: mockUser } });

    const result = await useAuthStore.getState().register({
      name: 'Maicol',
      email: 'maicol@ejemplo.com',
      password: 'password123',
    }) as LoginResult;

    expect(result.ok).toBe(true);
    expect(result.user).toEqual(mockUser);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('Debe manejar registro fallido', async () => {
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'El email ya está registrado' } },
    });

    const result = await useAuthStore.getState().register({
      name: 'Maicol',
      email: 'existente@ejemplo.com',
      password: 'password123',
    }) as LoginResult;

    expect(result.ok).toBe(false);
    expect(result.message).toBe('El email ya está registrado');
  });

  it('Debe manejar logout correctamente', async () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true, isCheckingAuth: false });
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.post.mockResolvedValueOnce({});

    await useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('Debe manejar checkAuth exitoso', async () => {
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.get.mockResolvedValueOnce({ data: { user: mockUser } });

    await useAuthStore.getState().checkAuth();
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isCheckingAuth).toBe(false);
  });

  it('Debe manejar checkAuth fallido', async () => {
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.get.mockRejectedValueOnce(new Error('No autorizado'));

    await useAuthStore.getState().checkAuth();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isCheckingAuth).toBe(false);
  });
});
