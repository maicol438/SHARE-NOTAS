import { useEffect, useState } from "react";
import { Search, Star, TrendingUp, Clock, Filter } from "lucide-react";
import useNoteStore from "../stores/useNoteStore.js";
import NoteCard from "../components/notes/NoteCard.jsx";
import Button from "../components/ui/Button.jsx";

const Explore = () => {
  const { publicNotes, fetchPublicNotes, categories, fetchCategories, toggleFavorite, downloadNote, rateNote, isLoading } = useNoteStore();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("rating");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    fetchPublicNotes({ search: debouncedSearch, category: selectedCategory, sort });
  }, [debouncedSearch, selectedCategory, sort]);

  const handleDownload = async (id) => {
    const result = await downloadNote(id);
    if (result.ok) {
      window.open(result.downloadUrl, "_blank");
    }
  };

  const handleRate = async (id, rating) => {
    await rateNote(id, rating);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Explorar notas públicas</h1>
        <p className="text-gray-500">Descubre notas de otros usuarios</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título..." className="input-field pl-9 w-full" />
        </div>

        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input-field">
          <option value="">Todas las categorías</option>
          {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
        </select>

        <div className="flex gap-2">
          <button onClick={() => setSort("rating")} className={`p-2 rounded-lg ${sort === "rating" ? "bg-primary-100 text-primary-600" : "hover:bg-gray-100"}`}>
            <Star className="w-5 h-5" />
          </button>
          <button onClick={() => setSort("downloads")} className={`p-2 rounded-lg ${sort === "downloads" ? "bg-primary-100 text-primary-600" : "hover:bg-gray-100"}`}>
            <TrendingUp className="w-5 h-5" />
          </button>
          <button onClick={() => setSort("newest")} className={`p-2 rounded-lg ${sort === "newest" ? "bg-primary-100 text-primary-600" : "hover:bg-gray-100"}`}>
            <Clock className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card p-4 animate-pulse"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-100 rounded" /></div>)}
        </div>
      )}

      {!isLoading && publicNotes.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500">No se encontraron notas públicas</p>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicNotes.map((note) => (
            <NoteCard key={note._id} note={note} external onToggleFavorite={toggleFavorite} onDownload={handleDownload} onRate={handleRate} showAuthor />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;