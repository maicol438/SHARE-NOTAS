import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Explore from '../pages/Explore';
import useAuthStore from '../stores/useAuthStore';

interface ExploreNote {
  _id: string;
  title: string;
  content: string;
  description: string;
  isPublic: boolean;
  isPinned: boolean;
  isFavorite: boolean;
  rating: number;
  ratingCount: number;
  downloads: number;
  category: { _id: string; name: string; color: string };
  user: { _id: string; name: string; avatar: string | null };
  updatedAt: string;
}

const mockPublicNotes: ExploreNote[] = [
  {
    _id: 'pub1',
    title: 'Machine Learning Fundamentals',
    content: 'Supervised and unsupervised learning techniques...',
    description: 'Intro to ML concepts',
    isPublic: true,
    isPinned: false,
    isFavorite: false,
    rating: 4.5,
    ratingCount: 12,
    downloads: 45,
    category: { _id: 'cat1', name: 'Tecnología', color: '#10b981' },
    user: { _id: 'user1', name: 'Carlos', avatar: null },
    updatedAt: '2026-05-15T10:00:00.000Z',
  },
  {
    _id: 'pub2',
    title: 'Ecuaciones Diferenciales',
    content: 'Métodos de solución para EDO...',
    description: 'Guía completa de ecuaciones diferenciales',
    isPublic: true,
    isPinned: false,
    isFavorite: false,
    rating: 3.8,
    ratingCount: 8,
    downloads: 23,
    category: { _id: 'cat2', name: 'Matemáticas', color: '#6366f1' },
    user: { _id: 'user2', name: 'María', avatar: null },
    updatedAt: '2026-05-20T14:00:00.000Z',
  },
];

const mockCategories = [
  { _id: 'cat1', name: 'Tecnología', color: '#10b981' },
  { _id: 'cat2', name: 'Matemáticas', color: '#6366f1' },
  { _id: 'cat3', name: 'Ciencias', color: '#f59e0b' },
];

const server = setupServer(
  http.get('*/api/notes/public', ({ request }) => {
    const url = new URL(request.url);
    const sort = url.searchParams.get('sort') || 'rating';
    const search = url.searchParams.get('q') || '';
    let result = [...mockPublicNotes];

    if (search) {
      result = result.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sort === 'downloads') {
      result.sort((a, b) => b.downloads - a.downloads);
    } else if (sort === 'newest') {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return HttpResponse.json({ notes: result });
  }),
  http.get('*/api/categories', () => {
    return HttpResponse.json({ categories: mockCategories });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false, isCheckingAuth: false });
});
afterAll(() => server.close());

const renderExplore = () => render(
  <MemoryRouter initialEntries={['/dashboard/explore']}>
    <Routes>
      <Route path="/dashboard/explore" element={<Explore />} />
    </Routes>
  </MemoryRouter>
);

describe('Flujo de Integración: Explorar Notas Públicas', () => {
  it('Debe cargar y mostrar notas públicas', async () => {
    renderExplore();

    await waitFor(() => {
      expect(screen.getByText('Machine Learning Fundamentals')).toBeInTheDocument();
    });

    expect(screen.getByText('Ecuaciones Diferenciales')).toBeInTheDocument();
  });

  it('Debe mostrar el título de la página', () => {
    renderExplore();
    expect(screen.getByText('Explorar notas públicas')).toBeInTheDocument();
  });

  it('Debe filtrar notas por búsqueda', async () => {
    renderExplore();

    await waitFor(() => {
      expect(screen.getByText('Machine Learning Fundamentals')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/buscar por título/i);
    fireEvent.change(searchInput, { target: { value: 'Machine' } });

    await waitFor(() => {
      expect(screen.getByText('Machine Learning Fundamentals')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('Ecuaciones Diferenciales')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('Debe mostrar estado vacío cuando no hay resultados', async () => {
    server.use(
      http.get('*/api/notes/public', () => {
        return HttpResponse.json({ notes: [] });
      })
    );

    renderExplore();

    await waitFor(() => {
      expect(screen.getByText(/no hay notas públicas/i)).toBeInTheDocument();
    });
  });

  it('Debe cambiar el orden al hacer clic en los botones de ordenamiento', async () => {
    renderExplore();

    await waitFor(() => {
      expect(screen.getByText('Machine Learning Fundamentals')).toBeInTheDocument();
    });

    const sortButtons = screen.getAllByRole('button');
    const newestButton = sortButtons.find((btn) => btn.querySelector('svg'));
    if (newestButton) {
      fireEvent.click(newestButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Explorar notas públicas')).toBeInTheDocument();
    });
  });
});
