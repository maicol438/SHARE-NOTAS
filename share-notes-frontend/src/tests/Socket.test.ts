vi.mock('socket.io-client', () => {
  const mockSocket = {
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
  };
  return {
    io: vi.fn(() => mockSocket),
  };
});

describe('Socket Service (Comentarios en tiempo real)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.cookie = '';
  });

  it('No debe conectar si no hay token', async () => {
    const { io } = await import('socket.io-client');
    const { connectSocket } = await import('../services/socket');

    connectSocket();
    expect(io).not.toHaveBeenCalled();
  });

  it('Debe conectar con token en cookie', async () => {
    document.cookie = 'token=fake-jwt-token; path=/';
    const { io } = await import('socket.io-client');
    const { connectSocket } = await import('../services/socket');

    connectSocket();

    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      auth: { token: 'fake-jwt-token' },
    }));
  });

  it('Debe registrar listener para comment:new', async () => {
    document.cookie = 'token=fake-jwt-token; path=/';
    const { connectSocket } = await import('../services/socket');

    const { io } = await import('socket.io-client');
    const mockSocketInstance = io();

    connectSocket();

    expect(mockSocketInstance.on).toHaveBeenCalledWith('comment:new', expect.any(Function));
  });

  it('Debe registrar listener para note:shared', async () => {
    document.cookie = 'token=fake-jwt-token; path=/';
    const { connectSocket } = await import('../services/socket');

    const { io } = await import('socket.io-client');
    const mockSocketInstance = io();

    connectSocket();

    expect(mockSocketInstance.on).toHaveBeenCalledWith('note:shared', expect.any(Function));
  });

  it('Debe desconectar y limpiar en disconnectSocket', async () => {
    document.cookie = 'token=fake-jwt-token; path=/';
    const { connectSocket, disconnectSocket } = await import('../services/socket');

    const { io } = await import('socket.io-client');

    connectSocket();
    const mockSocketInstance = io();

    disconnectSocket();

    expect(mockSocketInstance.disconnect).toHaveBeenCalled();
  });

  it('No debe reconectar si ya está conectado', async () => {
    document.cookie = 'token=fake-jwt-token; path=/';
    const { io } = await import('socket.io-client');
    const { connectSocket, getSocket } = await import('../services/socket');

    connectSocket();
    const mockSocketInstance = getSocket();
    if (!mockSocketInstance) throw new Error('Socket is null');
    mockSocketInstance.connected = true;

    connectSocket();

    expect(io).toHaveBeenCalledTimes(1);
  });
});
