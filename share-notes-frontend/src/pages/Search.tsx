import { useState, useEffect } from 'react';
import { Search, Filter, X, Star, Clock } from 'lucide-react';
import useNoteStore from '../stores/useNoteStore';
import NoteCard from '../components/notes/NoteCard';
import EmptyState from '../components/ui/EmptyState';

interface FiltersState {
  pinned: boolean;
  hasReminder: boolean;
  dateFrom: string;
  dateTo: string;
  tags: string;
}

interface Category {
  _id: string;
  name: string;
  color?: string;
}

const SearchPage: React.FC = () => {
  const {
    publicNotes = [],
    categories = [],
    fetchCategories,
    fetchPublicNotes,
    isLoading,
  } = useNoteStore();

  const [query, setQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FiltersState>({
    pinned: false,
    hasReminder: false,
    dateFrom: '',
    dateTo: '',
    tags: '',
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    fetchPublicNotes({
      q: debouncedQuery || undefined,
      category: selectedCategory || undefined,
    });
  }, [debouncedQuery, selectedCategory, filters, fetchPublicNotes]);

  const hasActiveFilters: boolean = !!selectedCategory || filters.pinned || filters.hasReminder || !!filters.dateFrom || !!filters.dateTo || !!filters.tags;

  const clearFilters = (): void => {
    setSelectedCategory('');
    setFilters({
      pinned: false,
      hasReminder: false,
      dateFrom: '',
      dateTo: '',
      tags: '',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold gradient-text mb-2">Buscar</h1>
        <p className="text-slate-500 dark:text-slate-400">Encuentra tus notas rápidamente</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            placeholder="Buscar por título, contenido o etiquetas..."
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#0d0b1f] border border-slate-200 dark:border-white/[0.06] rounded-xl text-base text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-white/[0.05] rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
            ${showFilters
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
            }
          `}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-primary-400 rounded-full" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-slate-500 dark:text-slate-500 hover:text-red-500 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-[#0d0b1f] border border-slate-200 dark:border-white/[0.06] rounded-xl p-6 mb-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                <option value="">Todas</option>
                {(categories || []).map((cat: Category) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Etiquetas
              </label>
              <input
                type="text"
                value={filters.tags}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilters({ ...filters, tags: e.target.value })
                }
                placeholder="Separadas por coma"
                className="input-field"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Rango de fechas
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 dark:text-slate-500 mb-1">Desde</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 dark:text-slate-500 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Filtros rápidos
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    setFilters({ ...filters, pinned: !filters.pinned })
                  }
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
                    ${filters.pinned
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400'
                    }
                  `}
                >
                  <Star className="w-4 h-4" />
                  Solo fijadas
                </button>
                <button
                  onClick={() =>
                    setFilters({ ...filters, hasReminder: !filters.hasReminder })
                  }
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
                    ${filters.hasReminder
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400'
                    }
                  `}
                >
                  <Clock className="w-4 h-4" />
                  Con recordatorio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-500">
          {isLoading ? 'Buscando...' : `${publicNotes.length} resultados`}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i: number) => (
            <div
              key={i}
              className="bg-white dark:bg-[#0d0b1f] border border-slate-200 dark:border-white/[0.06] rounded-xl p-6 animate-pulse"
            >
              <div className="h-4 bg-slate-200 dark:bg-white/[0.05] rounded w-3/4 mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-white/[0.05] rounded w-full" />
                <div className="h-3 bg-slate-200 dark:bg-white/[0.05] rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : publicNotes.length === 0 ? (
        <EmptyState
          type="search"
          title={debouncedQuery ? `No encontrado "${debouncedQuery}"` : 'Sin resultados'}
          subtitle={
            debouncedQuery
              ? 'Intenta con otras palabras clave'
              : 'Usa los filtros para mejorar tu búsqueda'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicNotes.map((note) => (
            <NoteCard key={note._id} note={note} showAuthor />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
