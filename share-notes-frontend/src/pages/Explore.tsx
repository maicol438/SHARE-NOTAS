import { useEffect, useState } from 'react';
import { Search, Star, TrendingUp, Clock } from 'lucide-react';
import useNoteStore from '../stores/useNoteStore';
import NoteCard from '../components/notes/NoteCard';
import EmptyState from '../components/ui/EmptyState';

const Explore: React.FC = () => {
  const { publicNotes = [], fetchPublicNotes, categories = [], fetchCategories, isLoading } = useNoteStore();

  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [sort, setSort] = useState<string>('rating');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    fetchPublicNotes({ q: debouncedSearch || undefined, category: selectedCategory || undefined, sort });
  }, [debouncedSearch, selectedCategory, sort, fetchPublicNotes]);

  const handleDownload = async (_id: string): Promise<void> => {
    window.open(`/api/notes/${_id}/download`, '_blank');
  };

  const handleRate = async (_id: string, _rating: number): Promise<void> => {
    // Rating handled by API
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Explorar notas públicas</h1>
        <p className="text-slate-500 dark:text-slate-400">Descubre notas de otros usuarios</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input type="text" value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} placeholder="Buscar por título..." className="input-field pl-9 w-full" />
        </div>

        <select value={selectedCategory} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)} className="input-field">
          <option value="">Todas las categorías</option>
          {(categories || []).map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
        </select>

        <div className="flex gap-2">
          <button onClick={() => setSort('rating')} className={`p-2 rounded-lg ${sort === 'rating' ? 'bg-primary-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-white/[0.05]'}`}>
            <Star className="w-5 h-5" />
          </button>
          <button onClick={() => setSort('downloads')} className={`p-2 rounded-lg ${sort === 'downloads' ? 'bg-primary-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-white/[0.05]'}`}>
            <TrendingUp className="w-5 h-5" />
          </button>
          <button onClick={() => setSort('newest')} className={`p-2 rounded-lg ${sort === 'newest' ? 'bg-primary-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-white/[0.05]'}`}>
            <Clock className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i: number) => <div key={i} className="bg-white dark:bg-[#0d0b1f] border border-slate-200 dark:border-white/[0.06] rounded-xl p-4 animate-pulse"><div className="h-4 bg-slate-200 dark:bg-white/[0.05] rounded w-3/4 mb-2" /><div className="h-3 bg-slate-200 dark:bg-white/[0.05] rounded" /></div>)}
        </div>
      )}

      {!isLoading && publicNotes.length === 0 && (
        <EmptyState 
          type="explore" 
          title={search ? `No encontramos "${search}"` : 'No hay notas públicas'}
          subtitle={search ? 'Intenta con otras palabras clave' : 'Sé el primero en compartir tus apuntes'}
        />
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicNotes.map((note) => (
            <NoteCard key={note._id} note={note} external showAuthor onDownload={handleDownload} onRate={handleRate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
