import { useState, useEffect } from 'react';
import { Shield, Users, StickyNote, Trash2, BarChart3, TrendingUp, Star, LucideIcon } from 'lucide-react';
import api from '../api/axios';
import { showToast } from '../utils/toast';

interface AdminStats {
  totalUsers: number;
  totalNotes: number;
  usersLastWeek: number;
  notesLastWeek: number;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  authProvider: string;
}

interface AdminNote {
  _id: string;
  title: string;
  content?: string;
  isPinned?: boolean;
  user?: { name: string };
  createdAt: string;
}

interface StatCardInfo {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

type TabId = 'dashboard' | 'users' | 'notes';

interface TabConfig {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const Admin: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [tab, setTab] = useState<TabId>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (tab === 'dashboard') fetchDashboard();
    if (tab === 'users') fetchUsers();
    if (tab === 'notes') fetchAllNotes();
  }, [tab]);

  const fetchDashboard = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.stats);
    } catch {
      showToast('Error al cargar estadísticas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } catch {
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllNotes = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await api.get('/admin/notes');
      setNotes(res.data.notes);
    } catch {
      showToast('Error al cargar notas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, role: string): Promise<void> => {
    try {
      await api.put('/admin/users/role', { userId, role });
      showToast('Rol actualizado', 'success');
      fetchUsers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(axiosErr.response?.data?.message || 'Error', 'error');
    }
  };

  const handleDeleteUser = async (userId: string): Promise<void> => {
    if (!confirm('¿Eliminar este usuario y todas sus notas?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      showToast('Usuario eliminado', 'success');
      fetchUsers();
    } catch {
      showToast('Error al eliminar', 'error');
    }
  };

  const statCards: StatCardInfo[] = stats ? [
    { label: 'Usuarios totales', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-indigo-600' },
    { label: 'Notas totales', value: stats.totalNotes, icon: StickyNote, color: 'from-primary-500 to-purple-600' },
    { label: 'Nuevos esta semana', value: stats.usersLastWeek, icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
    { label: 'Notas esta semana', value: stats.notesLastWeek, icon: BarChart3, color: 'from-orange-500 to-red-600' },
  ] : [];

  const tabs: TabConfig[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'notes', label: 'Notas', icon: StickyNote },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary-400" />
          Panel de Administración
        </h1>
        <p className="text-slate-500 dark:text-slate-500">Gestiona usuarios, notas y configuración del sistema</p>
      </div>

      <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-white/[0.06] pb-4">
        {tabs.map((t: TabConfig) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-700 dark:hover:text-surface-200'}`}>
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'dashboard' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i: number) => (
                <div key={i} className="bg-white dark:bg-[#0d0b1f] rounded-xl p-6 border border-slate-200 dark:border-white/[0.06] animate-pulse">
                  <div className="h-10 w-10 bg-slate-200 dark:bg-white/[0.05] rounded-xl mb-3" />
                  <div className="h-8 bg-slate-200 dark:bg-white/[0.05] rounded w-16 mb-2" />
                  <div className="h-4 bg-slate-200/50 dark:bg-white/[0.03] rounded w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((s: StatCardInfo, i: number) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="bg-white dark:bg-[#0d0b1f] rounded-xl p-6 border border-slate-200 dark:border-white/[0.06] animate-scale-in hover:border-slate-300 dark:hover:border-white/[0.1] transition-all" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg mb-4`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{s.value}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">{s.label}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i: number) => (
                <div key={i} className="bg-white dark:bg-[#0d0b1f] rounded-xl p-5 border border-slate-200 dark:border-white/[0.06] animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/[0.05]" />
                    <div className="flex-1">
                      <div className="h-5 bg-slate-200 dark:bg-white/[0.05] rounded w-40 mb-1" />
                      <div className="h-4 bg-slate-200/50 dark:bg-white/[0.03] rounded w-60" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u: AdminUser) => (
                <div key={u._id} className="bg-white dark:bg-[#0d0b1f] rounded-xl p-5 border border-slate-200 dark:border-white/[0.06] flex items-center justify-between gap-4 animate-fade-in hover:border-slate-300 dark:hover:border-white/[0.1] transition-all">
                  <div className="flex items-center gap-4">
                    {u.avatar ? (
                      <img src={u.avatar} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover" alt={u.name} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {u.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{u.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">{u.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded-full">{u.authProvider}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-primary-500/10 text-primary-400' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400'}`}>{u.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={u.role}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRoleChange(u._id, e.target.value)}
                      className="text-sm bg-slate-100 dark:bg-white/[0.05] border border-slate-300 dark:border-white/[0.08]/60 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={() => handleDeleteUser(u._id)} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 dark:text-slate-400 hover:text-red-400 transition-all" title="Eliminar usuario">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'notes' && (
        <div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i: number) => (
                <div key={i} className="bg-white dark:bg-[#0d0b1f] rounded-xl p-5 border border-slate-200 dark:border-white/[0.06] animate-pulse">
                  <div className="h-5 bg-slate-200 dark:bg-white/[0.05] rounded w-60 mb-2" />
                  <div className="h-4 bg-slate-200/50 dark:bg-white/[0.03] rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((n: AdminNote) => (
                <div key={n._id} className="bg-white dark:bg-[#0d0b1f] rounded-xl p-5 border border-slate-200 dark:border-white/[0.06] animate-fade-in hover:border-slate-300 dark:hover:border-white/[0.1] transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800 dark:text-white truncate">{n.title}</h3>
                        {n.isPinned && <Star className="w-3.5 h-3.5 text-primary-400 fill-primary-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Por {n.user?.name || 'Desconocido'} · {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {n.content && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{n.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
