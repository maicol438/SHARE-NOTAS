import { useState, useEffect } from "react";
import { Search, Filter, X, Calendar, Tag as TagIcon, Star, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import useNoteStore from "../stores/useNoteStore";
import NoteCard from "../components/notes/NoteCard";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

export default function SearchPage() {
  const {
    publicNotes = [],
    categories = [],
    fetchCategories,
    fetchPublicNotes,
    isLoading,
  } = useNoteStore();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    pinned: false,
    hasReminder: false,
    dateFrom: "",
    dateTo: "",
    tags: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const params = { search: debouncedQuery };
    if (selectedCategory) params.category = selectedCategory;
    if (filters.pinned) params.pinned = "true";
    if (filters.hasReminder) params.hasReminder = "true";
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.tags) params.tags = filters.tags;

    fetchPublicNotes(params);
  }, [debouncedQuery, selectedCategory, filters]);

  const hasActiveFilters = selectedCategory || filters.pinned || filters.hasReminder || filters.dateFrom || filters.dateTo || filters.tags;

  const clearFilters = () => {
    setSelectedCategory("");
    setFilters({
      pinned: false,
      hasReminder: false,
      dateFrom: "",
      dateTo: "",
      tags: "",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold gradient-text mb-2">Buscar</h1>
        <p className="text-gray-500">Encuentra tus notas rápidamente</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, contenido o etiquetas..."
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
            ${showFilters
              ? "bg-primary-500 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }
          `}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-white rounded-full" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                <option value="">Todas</option>
                {(categories || []).map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Etiquetas
              </label>
              <input
                type="text"
                value={filters.tags}
                onChange={(e) =>
                  setFilters({ ...filters, tags: e.target.value })
                }
                placeholder="Separadas por coma"
                className="input-field"
              />
            </div>

            {/* Date Range */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rango de fechas
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Desde</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
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
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
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

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          {isLoading ? "Buscando..." : `${publicNotes.length} resultados`}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : publicNotes.length === 0 ? (
        <EmptyState
          type="search"
          title={debouncedQuery ? `No encontrado "${debouncedQuery}"` : "Sin resultados"}
          subtitle={
            debouncedQuery
              ? "Intenta con otras palabras clave"
              : "Usa los filtros para mejorar tu búsqueda"
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
}