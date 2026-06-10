import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Register from '../pages/Register';
import useAuthStore from '../stores/useAuthStore';

const server = setupServer(
  http.post('*/api/auth/register', () => {
    return HttpResponse.json(
      { user: { id: 1, name: 'Maicol', email: 'maicol@ejemplo.com' } },
      { status: 201 }
    );
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => { server.resetHandlers(); useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false, isCheckingAuth: false }); });
afterAll(() => server.close());

const renderRegister = () => {
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false, isCheckingAuth: false });
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Flujo de Integración: Registro de Usuario', () => {
  it('Debe renderizar el formulario de registro correctamente', () => {
    renderRegister();
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it('Debe mostrar errores de validación si los campos están vacíos', () => {
    renderRegister();
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    expect(screen.getByText(/mínimo 2 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/mínimo 6 caracteres/i)).toBeInTheDocument();
  });

  it('Debe registrar exitosamente y redirigir al login', async () => {
    renderRegister();

    fireEvent.change(screen.getByLabelText(/nombre completo/i), {
      target: { value: 'Maicol' },
    });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'maicol@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('Debe mostrar error si el email ya existe (409)', async () => {
    server.use(
      http.post('*/api/auth/register', () => {
        return HttpResponse.json(
      { message: 'El email ya está registrado' },
      { status: 409 }
    );
      })
    );

    renderRegister();

    fireEvent.change(screen.getByLabelText(/nombre completo/i), {
      target: { value: 'Maicol' },
    });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'existente@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByText(/el email ya está registrado/i)).toBeInTheDocument();
    });
  });

  it('Debe deshabilitar el botón mientras carga', async () => {
    server.use(
      http.post('*/api/auth/register', async () => {
        await new Promise((r) => setTimeout(r, 500));
        return HttpResponse.json(
          { user: { id: 1, name: 'Maicol', email: 'maicol@ejemplo.com' } },
          { status: 201 }
        );
      })
    );

    renderRegister();

    const button = screen.getAllByText('Crear cuenta').find((el): el is HTMLButtonElement => el.tagName === 'BUTTON')!;

    fireEvent.change(screen.getByLabelText(/nombre completo/i), {
      target: { value: 'Maicol' },
    });
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
