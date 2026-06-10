import { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, Trash2, Save, AlertTriangle, Chrome } from 'lucide-react';
import api from '../api/axios';
import { showToast } from '../utils/toast';
import Button from '../components/ui/Button';
import useAuthStore from '../stores/useAuthStore';

interface ProfileForm {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface ProfileStats {
  totalNotes: number;
  sharedWithMe: number;
}

const Profile: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isGoogleUser = user?.authProvider === 'google';

  const [form, setForm] = useState<ProfileForm>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<ProfileStats>({ totalNotes: 0, sharedWithMe: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deletePassword, setDeletePassword] = useState<string>('');
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');
  const [unlinkingGoogle, setUnlinkingGoogle] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, name: user.name, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        const res = await api.get('/users/me');
        setStats(res.data.stats);
      } catch (err: unknown) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((er) => ({ ...er, [name]: '' }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim() || form.name.length < 2) {
      errs.name = 'Mínimo 2 caracteres';
    }
    if (!form.email) errs.email = 'El email es requerido';
    if (form.newPassword || form.confirmPassword) {
      if (!isGoogleUser && !form.currentPassword) errs.currentPassword = 'Requiere contraseña actual';
      if (form.newPassword.length < 6) errs.newPassword = 'Mínimo 6 caracteres';
      if (form.newPassword !== form.confirmPassword) {
        errs.confirmPassword = 'Las contraseñas no coinciden';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data: Record<string, string> = { name: form.name, email: form.email };
      if (form.newPassword || isGoogleUser) {
        if (!isGoogleUser) data.currentPassword = form.currentPassword;
        data.newPassword = form.newPassword || '';
      }

      const res = await api.put('/users/me', data);

      if (!res.data) {
        throw new Error('No response data');
      }

      const userData = res.data.user || res.data;

      setUser(userData);
      showToast('Perfil actualizado', 'success');

      if (form.newPassword) {
        setForm((f) => ({
          ...f,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg = axiosErr.response?.data?.message || axiosErr.message || 'Error al actualizar';
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/users/me/avatar', formData);

      if (!res.data) {
        throw new Error('No response data');
      }

      const avatarUrl = res.data.user?.avatar || res.data.avatar;

      if (avatarUrl && user) {
        setUser({ ...user, avatar: avatarUrl });
        showToast('Avatar actualizado', 'success');
        e.target.value = '';
      } else {
        throw new Error('No se recibió URL del avatar');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg = axiosErr.response?.data?.message || axiosErr.message || 'Error al subir imagen';
      showToast(errorMsg, 'error');
    }
  };

  const handleUnlinkGoogle = async (): Promise<void> => {
    if (!form.newPassword || form.newPassword.length < 6) {
      showToast('Establece una contraseña primero (mínimo 6 caracteres)', 'error');
      return;
    }
    setUnlinkingGoogle(true);
    try {
      const res = await api.post('/users/me/unlink-google', {
        password: form.newPassword,
      });
      if (res.data) {
        setUser(res.data.user || res.data);
        showToast('Cuenta de Google desvinculada exitosamente', 'success');
        setForm((f) => ({ ...f, newPassword: '', confirmPassword: '' }));
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(axiosErr.response?.data?.message || 'Error al desvincular Google', 'error');
    } finally {
      setUnlinkingGoogle(false);
    }
  };

  const handleDeleteAccount = async (): Promise<void> => {
    if (!isGoogleUser && !deletePassword) {
      showToast('Ingresa tu contraseña', 'error');
      return;
    }
    if (isGoogleUser && deleteConfirmText !== 'ELIMINAR') {
      showToast('Escribe ELIMINAR para confirmar', 'error');
      return;
    }

    try {
      const data = isGoogleUser ? {} : { password: deletePassword };
      await api.delete('/users/me', { data });
      window.location.href = '/';
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(axiosErr.response?.data?.message || 'Contraseña incorrecta', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold gradient-text mb-2">Mi Perfil</h1>
        <p className="text-gray-500 dark:text-slate-500">Administra tu información</p>
      </div>

      <div className="bg-white dark:bg-[#0d0b1f] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          <div className="relative flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-lg sm:text-xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
            <label className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-primary-500 text-white rounded-full cursor-pointer hover:bg-primary-600 transition-colors shadow-lg">
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-800 dark:text-white text-lg truncate">{user?.name}</h3>
            <p className="text-gray-500 dark:text-slate-500 text-sm truncate">{user?.email}</p>
            {isGoogleUser && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 bg-primary-500/10 text-primary-500 dark:text-primary-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                <Chrome className="w-3 h-3" /> Google
              </span>
            )}
            <div className="flex justify-center sm:justify-start gap-4 mt-2 text-sm">
              <span className="text-gray-500 dark:text-slate-500">
                <strong className="text-gray-800 dark:text-white">{stats.totalNotes}</strong> notas
              </span>
              <span className="text-gray-500 dark:text-slate-500">
                <strong className="text-gray-800 dark:text-white">{stats.sharedWithMe}</strong> compartidas
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-[#0d0b1f] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4 sm:p-6">
          <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-4 sm:mb-6">Información personal</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                Nombre
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`input-field pl-12 ${errors.name ? 'border-red-500/50' : ''}`}
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`input-field pl-12 ${errors.email ? 'border-red-500/50' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0d0b1f] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4 sm:p-6">
          <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-4 sm:mb-6">
            {isGoogleUser ? 'Establecer contraseña' : 'Cambiar contraseña'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-500 mb-4">
            {isGoogleUser
              ? 'Establece una contraseña para desvincular tu cuenta de Google y usar email/contraseña.'
              : 'Deja vacío si no quieres cambiar la contraseña'}
          </p>

          <div className="space-y-4">
            {!isGoogleUser && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                  Contraseña actual
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                  <input
                    type="password"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    placeholder="********"
                    className={`input-field pl-12 ${errors.currentPassword ? 'border-red-500/50' : ''}`}
                  />
                </div>
                {errors.currentPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.currentPassword}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                {isGoogleUser ? 'Contraseña' : 'Nueva contraseña'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                <input
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className={`input-field pl-12 ${errors.newPassword ? 'border-red-500/50' : ''}`}
                />
              </div>
              {errors.newPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite la nueva contraseña"
                  className={`input-field pl-12 ${errors.confirmPassword ? 'border-red-500/50' : ''}`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {isGoogleUser && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={handleUnlinkGoogle}
                disabled={unlinkingGoogle}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 font-bold text-sm transition-all border border-red-500/20 disabled:opacity-50"
              >
                <Chrome className="w-4 h-4" />
                {unlinkingGoogle ? 'Desvinculando...' : 'Desvincular cuenta de Google'}
              </button>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                Establece una contraseña arriba y luego haz clic en este botón para desvincular tu cuenta de Google.
                Podrás iniciar sesión con email y la contraseña que establezcas.
              </p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full py-3 text-base"
          icon={Save}
        >
          Guardar cambios
        </Button>
      </form>

      <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 sm:p-6 mt-6 sm:mt-8">
        <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Zona de peligro
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          Eliminar tu cuenta es permanente y no se puede deshacer.
        </p>
        <Button
          variant="danger"
          onClick={() => setShowDeleteModal(true)}
          icon={Trash2}
        >
          Eliminar cuenta
        </Button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-[#0d0b1f] border border-gray-200 dark:border-white/[0.06] rounded-xl max-w-md w-full animate-scale-in p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">¿Eliminar cuenta?</h3>
            <p className="text-gray-500 dark:text-slate-500 mb-4">
              Esta acción es irreversible y eliminará todas tus notas.
            </p>
            {isGoogleUser ? (
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-slate-500 mb-2">
                  Escribe <strong>ELIMINAR</strong> para confirmar:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeleteConfirmText(e.target.value)}
                  placeholder="ELIMINAR"
                  className="input-field"
                />
              </div>
            ) : (
              <input
                type="password"
                value={deletePassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeletePassword(e.target.value)}
                placeholder="Tu contraseña"
                className="input-field mb-4"
              />
            )}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                className="flex-1"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
