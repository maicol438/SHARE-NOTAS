import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  BookOpen,
  Tag,
  StickyNote,
  Star,
  CheckSquare,
  LogOut,
  Search,
  BarChart3,
  FolderOpen,
  Users,
  Shield,
  Calendar,
  LucideIcon,
} from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import { showToast } from '../../utils/toast';

interface NavItemData {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

interface SidebarProps {
  onNavClick?: () => void;
}

const navItems: NavItemData[] = [
  { id: 'notas',        label: 'Mis Notas',      icon: StickyNote, path: '/dashboard' },
  { id: 'docs',         label: 'Documentación',   icon: BookOpen,   path: '/dashboard' },
  { id: 'categorias',   label: 'Categorías',      icon: Tag,        path: '/dashboard' },
  { id: 'favoritos',    label: 'Favoritos',       icon: Star,       path: '/dashboard?tab=favorites' },
  { id: 'tareas',       label: 'Tareas',          icon: CheckSquare,path: '/dashboard/tasks' },
  { id: 'perfil',       label: 'Perfil',          icon: User,       path: '/dashboard/profile' },
];

const extraItems: NavItemData[] = [
  { id: 'buscar',       label: 'Buscar',         icon: Search,     path: '/dashboard/search' },
  { id: 'archivos',     label: 'Archivos',       icon: FolderOpen, path: '/dashboard/files' },
  { id: 'compartido',   label: 'Compartido',     icon: Users,      path: '/dashboard/shared' },
  { id: 'estadisticas', label: 'Estadísticas',   icon: BarChart3,  path: '/dashboard/stats' },
  { id: 'calendario',   label: 'Calendario',     icon: Calendar,   path: '/dashboard/calendar' },
];

const mobileNavItems: NavItemData[] = [
  { id: 'notas',      label: 'Notas',   icon: StickyNote, path: '/dashboard' },
  { id: 'buscar',     label: 'Buscar',  icon: Search,     path: '/dashboard/search' },
  { id: 'tareas',     label: 'Tareas',  icon: CheckSquare,path: '/dashboard/tasks' },
  { id: 'perfil',     label: 'Perfil',  icon: User,       path: '/dashboard/profile' },
];

export default function Sidebar({ onNavClick }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const isAdmin: boolean = user?.role === 'admin';
  const [showLogout, setShowLogout] = useState<boolean>(false);

  const isActive = (path: string): boolean => {
    if (path.includes('?')) {
      const [base, query] = path.split('?');
      return location.pathname === base && location.search.includes(query);
    }
    if (path === '/dashboard') return location.pathname === '/dashboard' && !location.search;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleClick = (): void => onNavClick?.();

  const handleLogout = async (): Promise<void> => {
    setShowLogout(false);
    await logout();
    showToast('Sesión cerrada', 'success');
    navigate('/login');
  };

  const NavItem = ({ item }: { item: NavItemData }) => {
    const Icon: LucideIcon = item.icon;
    const active: boolean = isActive(item.path);
    return (
      <Link
        to={item.path}
        onClick={handleClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative text-sm font-semibold
          ${active
            ? 'bg-primary-500/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/20 dark:border-primary-500/20 shadow-sm'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05] border border-transparent'
          }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-primary-500 to-purple-500 shadow-lg shadow-primary-500/50" />
        )}
        <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${active ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-400'}`} />
        <span>{item.label}</span>
        {active && (
          <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400 shadow-sm shadow-primary-400 animate-pulse" />
        )}
      </Link>
    );
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col h-full w-[220px] bg-white/90 dark:bg-[#070714]/90 backdrop-blur-2xl border-r border-gray-200/60 dark:border-white/[0.06] relative z-20 shadow-lg dark:shadow-2xl dark:shadow-black/30">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-white/[0.06]">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 group w-full">
            <div className="hex-logo" style={{ width: 38, height: 38 }}>
              <div className="hex-logo-inner" style={{ width: 34, height: 34 }}>
                <span className="font-extrabold text-sm bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">SN</span>
              </div>
            </div>
            <span className="font-bold text-base tracking-wide text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">ShareNotes</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {navItems.map((item: NavItemData) => <NavItem key={item.id} item={item} />)}
          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-white/[0.04] space-y-1">
            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase tracking-[0.15em] px-3 mb-2 block">Más opciones</span>
            {extraItems.map((item: NavItemData) => <NavItem key={item.id} item={item} />)}
            {isAdmin && (
              <NavItem item={{ id: 'admin', label: 'Admin Panel', icon: Shield, path: '/dashboard/admin' }} />
            )}
          </div>
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-white/[0.06] space-y-1">
          {user && (
            <Link to="/dashboard/profile" onClick={handleClick}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all group border border-transparent hover:border-gray-200 dark:hover:border-white/[0.06]">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-500/20 group-hover:ring-primary-500/40 transition-all" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center ring-2 ring-primary-500/20 group-hover:ring-primary-500/40 transition-all">
                  <span className="text-white font-bold text-sm uppercase">{user.name?.charAt(0)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors leading-snug">{user.name}</p>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{user.email}</p>
              </div>
            </Link>
          )}
          <button onClick={() => setShowLogout(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-all font-semibold text-sm border border-transparent hover:border-red-500/10">
            <LogOut className="w-[18px] h-[18px]" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#070714]/95 backdrop-blur-2xl border-t border-gray-200 dark:border-white/[0.06] safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item: NavItemData) => {
            const Icon: LucideIcon = item.icon;
            const active: boolean = isActive(item.path);
            return (
              <Link key={item.id} to={item.path} onClick={handleClick}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all
                  ${active ? 'text-primary-600 dark:text-primary-400 bg-primary-500/10 font-bold' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-200'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[9px] tracking-wide font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {showLogout && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in"
          onClick={() => setShowLogout(false)}>
          <div className="bg-white dark:bg-[#0d0b1f] border border-gray-200 dark:border-white/[0.08] rounded-3xl p-7 w-full max-w-sm text-center shadow-xl dark:shadow-2xl animate-scale-in"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Cerrar sesión</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">¿Estás seguro de que deseas cerrar sesión?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-slate-300 font-bold hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-all border border-gray-200 dark:border-white/[0.06]">
                Cancelar
              </button>
              <button onClick={handleLogout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 font-bold hover:bg-red-500/20 transition-all border border-red-500/20">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
