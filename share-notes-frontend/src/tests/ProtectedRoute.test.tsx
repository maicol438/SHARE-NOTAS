import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute';
import useAuthStore from '../stores/useAuthStore';

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isCheckingAuth: false,
    });
  });

  it('Debe mostrar loading mientras verifica autenticación', () => {
    useAuthStore.setState({ isCheckingAuth: true });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/verificando sesión/i)).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('Debe redirigir a /login si no está autenticado', () => {
    useAuthStore.setState({ isCheckingAuth: false, isAuthenticated: false });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div data-testid="protected-content">Contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('Debe renderizar children si está autenticado', () => {
    useAuthStore.setState({
      isCheckingAuth: false,
      isAuthenticated: true,
      user: { _id: 'user1', name: 'Maicol', email: 'maicol@ejemplo.com', role: 'user' },
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});
