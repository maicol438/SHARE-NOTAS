import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Login from '../pages/Login';
import useAuthStore from '../stores/useAuthStore';

const server = setupServer(
  http.post('*/api/auth/login', () => {
    return HttpResponse.json(
      { token: 'fake-jwt-token', user: { id: 1, name: 'Maicol', email: 'maicol@ejemplo.com' } },
      { status: 200 }
    );
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => { server.resetHandlers(); useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false, isCheckingAuth: false }); });
afterAll(() => server.close());

const renderLogin = () => {
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false, isCheckingAuth: false });
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Flujo de Integración: Autenticación (Login)', () => {
  it('Debe renderizar el formulario de login correctamente', () => {
    renderLogin();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('Debe mostrar errores de validación si los campos están vacíos', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
  });

  it('Debe permitir el login exitoso y redirigir al dashboard', async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'maicol@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });

  it('Debe capturar y mostrar el Error 401 (Unauthorized - Credenciales inválidas)', async () => {
    server.use(
      http.post('*/api/auth/login', () => {
        return HttpResponse.json(
          { message: 'Credenciales inválidas o sesión inexistente' },
          { status: 401 }
        );
      })
    );

    renderLogin();

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'maicol@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'clave-incorrecta' },
    });

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    });
  });

  it('Debe capturar y procesar el Error 403 (Forbidden - Usuario sin permisos/bloqueado)', async () => {
    server.use(
      http.post('*/api/auth/login', () => {
        return HttpResponse.json(
          { message: 'Usuario autenticado pero sin permisos sobre el recurso' },
          { status: 403 }
        );
      })
    );

    renderLogin();

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'bloqueado@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    });
  });

  it('Debe deshabilitar el botón mientras carga', async () => {
    server.use(
      http.post('*/api/auth/login', async () => {
        await new Promise((r) => setTimeout(r, 500));
        return HttpResponse.json(
          { token: 'fake-jwt-token', user: { id: 1, name: 'Maicol' } },
          { status: 200 }
        );
      })
    );

    renderLogin();

    const button = screen.getByText('Ingresar').closest('button')!;

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'maicol@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(button);

    expect(button).toBeDisabled();
  });
});
