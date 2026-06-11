import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Dashboard from '../pages/Dashboard';
import useAuthStore from '../stores/useAuthStore';
import useNoteStore from '../stores/useNoteStore';

const mockNotes = [
  {
    _id: 'note1',
    title: 'Apuntes de Cálculo',
    content: 'Derivadas e integrales son conceptos fundamentales...',
    isPinned: true,
    isFavorite: false,
    category: { _id: 'cat1', name: 'Matemáticas', color: '#6366f1' },
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
  },
  {
    _id: 'note2',
    title: 'Apuntes de IA',
    content: 'Machine Learning y Deep Learning...',
    isPinned: false,
    isFavorite: true,
    category: { _id: 'cat2', name: 'Tecnología', color: '#10b981' },
    createdAt: '2026-06-02T15:30:00.000Z',
    updatedAt: '2026-06-02T15:30:00.000Z',
  },
];

const mockCategories = [
  { _id: 'cat1', name: 'Matemáticas', color: '#6366f1' },
  { _id: 'cat2', name: 'Tecnología', color: '#10b981' },
];

const server = setupServer(
  http.get(/\/api\/notes/, () => {
    return HttpResponse.json({ notes: mockNotes });
  }),
  http.get(/\/api\/categories/, () => {
    return HttpResponse.json({ categories: mockCategories });
  }),
  http.get(/\/api\/files/, () => {
    return HttpResponse.json({ files: [] });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false, isCheckingAuth: false });
  useNoteStore.setState({ notes: [], categories: [], files: [], publicNotes: [], trashNotes: [] });
});
afterAll(() => server.close());

const renderDashboard = (): void => {
  useAuthStore.setState({
    user: { _id: 'user1', name: 'Maicol', email: 'maicol@ejemplo.com', role: 'user' as const },
    isAuthenticated: true,
    isCheckingAuth: false,
  });

  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Dashboard Page', () => {
  it('Debe cargar y mostrar las notas del usuario', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Apuntes de Cálculo')).toBeInTheDocument();
    });

    expect(screen.getByText('Apuntes de IA')).toBeInTheDocument();
  });

  it('Debe mostrar las categorías cargadas', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText('Matemáticas').length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText('Tecnología').length).toBeGreaterThan(0);
  });

  it('Debe mostrar estado vacío cuando no hay notas', async () => {
    server.use(
      http.get(/\/api\/notes/, () => {
        return HttpResponse.json({ notes: [] });
      })
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/tu espacio está vacío/i)).toBeInTheDocument();
    });
  });
});
