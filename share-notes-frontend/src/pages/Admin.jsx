import { useState, useEffect } from "react";
import { Shield, Users, StickyNote, Trash2, BarChart3, TrendingUp, User, Star } from "lucide-react";
import api from "../api/axios";
import { showToast } from "../utils/toast.jsx";
import Button from "../components/ui/Button";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab === "dashboard") fetchDashboard();
    if (tab === "users") fetchUsers();
    if (tab === "notes") fetchAllNotes();
  }, [tab]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/dashboard");
      setStats(res.data.stats);
    } catch (err) {
      showToast("Error al cargar estadísticas", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      showToast("Error al cargar usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/notes");
      setNotes(res.data.notes);
    } catch (err) {
      showToast("Error al cargar notas", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put("/admin/users/role", { userId, role });
      showToast("Rol actualizado", "success");
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Error", "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("¿Eliminar este usuario y todas sus notas?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      showToast("Usuario eliminado", "success");
      fetchUsers();
    } catch (err) {
      showToast("Error al eliminar", "error");
    }
  };

  const statCards = stats ? [
    { label: "Usuarios totales", value: stats.totalUsers, icon: Users, color: "from-blue-500 to-indigo-600" },
    { label: "Notas totales", value: stats.totalNotes, icon: StickyNote, color: "from-primary-500 to-purple-600" },
    { label: "Nuevos esta semana", value: stats.usersLastWeek, icon: TrendingUp, color: "from-green-500 to-emerald-600" },
    { label: "Notas esta semana", value: stats.notesLastWeek, icon: BarChart3, color: "from-orange-500 to-red-600" },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold gradient-text mb-2 flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary-500" />
          Panel de Administración
        </h1>
        <p className="text-gray-500">Gestiona usuarios, notas y configuración del sistema</p>
      </div>

      <div className="flex gap-2 mb-8 border-b border-gray-100 dark:border-dark-800 pb-4">
        {[
          { id: "dashboard", label: "Dashboard", icon: BarChart3 },
          { id: "users", label: "Usuarios", icon: Users },
          { id: "notes", label: "Notas", icon: StickyNote },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800"}`}>
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "dashboard" && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-dark-900 rounded-2xl p-6 border border-gray-100 dark:border-dark-800 animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-dark-700 rounded-xl mb-3" />
                  <div className="h-8 bg-gray-200 dark:bg-dark-700 rounded w-16 mb-2" />
                  <div className="h-4 bg-gray-100 dark:bg-dark-800 rounded w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="bg-white dark:bg-dark-900 rounded-2xl p-6 border border-gray-100 dark:border-dark-800 animate-scale-in shadow-sm hover:shadow-md transition-all" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg mb-4`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{s.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "users" && (
        <div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-gray-100 dark:border-dark-800 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-700" />
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-dark-700 rounded w-40 mb-1" />
                      <div className="h-4 bg-gray-100 dark:bg-dark-800 rounded w-60" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u._id} className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-gray-100 dark:border-dark-800 flex items-center justify-between gap-4 animate-fade-in hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    {u.avatar ? (
                      <img src={u.avatar} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {u.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-dark-800 px-2 py-0.5 rounded-full">{u.authProvider}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600" : "bg-gray-100 dark:bg-dark-800 text-gray-500"}`}>{u.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="text-sm border border-gray-200 dark:border-dark-700 rounded-xl px-3 py-2 bg-white dark:bg-dark-850 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={() => handleDeleteUser(u._id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all" title="Eliminar usuario">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "notes" && (
        <div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-gray-100 dark:border-dark-800 animate-pulse">
                  <div className="h-5 bg-gray-200 dark:bg-dark-700 rounded w-60 mb-2" />
                  <div className="h-4 bg-gray-100 dark:bg-dark-800 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n._id} className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-gray-100 dark:border-dark-800 animate-fade-in hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{n.title}</h3>
                        {n.isPinned && <Star className="w-3.5 h-3.5 text-primary-500 fill-primary-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Por {n.user?.name || "Desconocido"} · {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {n.content && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{n.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
