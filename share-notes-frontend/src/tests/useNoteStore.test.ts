import useNoteStore from '../stores/useNoteStore';

const mockNote = {
  _id: 'note1',
  title: 'Nota de prueba',
  content: 'Contenido de prueba',
  createdAt: '2026-06-01T10:00:00.000Z',
  updatedAt: '2026-06-01T10:00:00.000Z',
  isPinned: false,
  isFavorite: false,
  category: { _id: 'cat1', name: 'General', color: '#6366f1' },
};

const mockCategory = { _id: 'cat1', name: 'General', color: '#6366f1' };

vi.mock('../api/axios', () => {
  const mockAxios = {
    defaults: { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
    interceptors: {
      request: { handlers: [] as unknown[] },
      response: { handlers: [] as unknown[] },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  };
  return { default: mockAxios, onUnauthorized: vi.fn(), onForbidden: vi.fn(), API_BASE: '' };
});

describe('useNoteStore (Zustand)', () => {
  beforeEach(() => {
    useNoteStore.setState({
      notes: [],
      publicNotes: [],
      trashNotes: [],
      files: [],
      categories: [],
      notebooks: [],
      tags: [],
      isLoading: false,
      activeCategory: null,
      searchQuery: '',
      favoriteFilter: false,
      localSearch: '',
    });
  });

  it('Debe tener estado inicial correcto', () => {
    const state = useNoteStore.getState();
    expect(state.notes).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.favoriteFilter).toBe(false);
  });

  it('Debe obtener notas exitosamente', async () => {
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.get.mockResolvedValueOnce({ data: { notes: [mockNote] } });

    await useNoteStore.getState().fetchNotes();

    expect(useNoteStore.getState().notes).toEqual([mockNote]);
    expect(useNoteStore.getState().isLoading).toBe(false);
  });

  it('Debe crear una nota exitosamente', async () => {
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.post.mockResolvedValueOnce({ data: { note: mockNote } });

    const result = await useNoteStore.getState().createNote({
      title: 'Nota de prueba', content: 'Contenido de prueba', category: 'cat1',
    });

    expect(result).toEqual(mockNote);
    expect(useNoteStore.getState().notes).toContainEqual(mockNote);
  });

  it('Debe actualizar una nota exitosamente', async () => {
    useNoteStore.setState({ notes: [mockNote] });
    const updatedNote = { ...mockNote, title: 'Título actualizado' };
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.put.mockResolvedValueOnce({ data: { note: updatedNote } });

    await useNoteStore.getState().updateNote('note1', { title: 'Título actualizado' });

    expect(useNoteStore.getState().notes[0].title).toBe('Título actualizado');
  });

  it('Debe eliminar una nota (mover a papelera)', async () => {
    useNoteStore.setState({ notes: [mockNote] });
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.delete.mockResolvedValueOnce({});

    await useNoteStore.getState().deleteNote('note1');

    expect(useNoteStore.getState().notes).toEqual([]);
  });

  it('Debe alternar el pin de una nota', async () => {
    useNoteStore.setState({ notes: [mockNote] });
    const pinnedNote = { ...mockNote, isPinned: true };
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.patch.mockResolvedValueOnce({ data: { note: pinnedNote } });

    await useNoteStore.getState().togglePin('note1');

    expect(useNoteStore.getState().notes[0].isPinned).toBe(true);
  });

  it('Debe alternar favorito de una nota', async () => {
    useNoteStore.setState({ notes: [mockNote] });
    const favNote = { ...mockNote, isFavorite: true };
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.patch.mockResolvedValueOnce({ data: { note: favNote } });

    await useNoteStore.getState().toggleFavorite('note1');

    expect(useNoteStore.getState().notes[0].isFavorite).toBe(true);
  });

  it('Debe obtener notas públicas', async () => {
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.get.mockResolvedValueOnce({ data: { notes: [mockNote] } });

    await useNoteStore.getState().fetchPublicNotes();

    expect(useNoteStore.getState().publicNotes).toEqual([mockNote]);
  });

  it('Debe obtener categorías', async () => {
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.get.mockResolvedValueOnce({ data: { categories: [mockCategory] } });

    await useNoteStore.getState().fetchCategories();

    expect(useNoteStore.getState().categories).toEqual([mockCategory]);
  });

  it('Debe filtrar notas por búsqueda local', () => {
    useNoteStore.setState({
      notes: [
        { ...mockNote, title: 'Cálculo Diferencial', createdAt: '2026-01-01T00:00:00.000Z' },
        { ...mockNote, _id: 'note2', title: 'Álgebra Lineal', isPinned: true, createdAt: '2026-01-02T00:00:00.000Z' },
      ],
    });

    useNoteStore.getState().localSearchNotes('Cálculo');
    const filtered = useNoteStore.getState().getFilteredNotes();

    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Cálculo Diferencial');
  });

  it('Debe filtrar notas por favoritos', () => {
    const favNote = { ...mockNote, _id: 'fav1', isFavorite: true, createdAt: '2026-01-01T00:00:00.000Z' };
    useNoteStore.setState({ notes: [mockNote, favNote], favoriteFilter: true });

    const filtered = useNoteStore.getState().getFilteredNotes();

    expect(filtered).toHaveLength(1);
    expect(filtered[0]._id).toBe('fav1');
  });

  it('Debe ordenar notas fijadas primero', () => {
    const normal = { ...mockNote, _id: 'normal', isPinned: false, createdAt: '2026-01-01T00:00:00.000Z' };
    const pinned = { ...mockNote, _id: 'pinned', isPinned: true, createdAt: '2026-01-02T00:00:00.000Z' };
    useNoteStore.setState({ notes: [normal, pinned] });

    const sorted = useNoteStore.getState().getFilteredNotes();

    expect(sorted[0]._id).toBe('pinned');
    expect(sorted[1]._id).toBe('normal');
  });

  it('Debe restaurar una nota desde la papelera', async () => {
    useNoteStore.setState({ trashNotes: [mockNote] });
    const api = vi.mocked((await import('../api/axios')).default, true);
    api.patch.mockResolvedValueOnce({});

    await useNoteStore.getState().restoreNote('note1');

    expect(useNoteStore.getState().trashNotes).toEqual([]);
  });
});
