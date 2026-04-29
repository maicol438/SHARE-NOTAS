import { useState, useEffect } from "react";
import { User, Mail, Lock, Camera, Trash2, Save, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import Button from "../components/ui/Button";
import useAuthStore from "../stores/useAuthStore";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ totalNotes: 0, sharedWithMe: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, name: user.name, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/users/me");
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.length < 2) {
      errs.name = "Mínimo 2 caracteres";
    }
    if (!form.email) errs.email = "El email es requerido";
    if (form.newPassword || form.confirmPassword) {
      if (!form.currentPassword) errs.currentPassword = "Requiere contraseña actual";
      if (form.newPassword.length < 6) errs.newPassword = "Mínimo 6 caracteres";
      if (form.newPassword !== form.confirmPassword) {
        errs.confirmPassword = "Las contraseñas no coinciden";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = { name: form.name, email: form.email };
      if (form.newPassword) {
        data.currentPassword = form.currentPassword;
        data.newPassword = form.newPassword;
      }

      const res = await api.put("/users/me", data);
      setUser({ ...user, ...res.data.user });
      toast.success("Perfil actualizado ✅");

      if (form.newPassword) {
        setForm((f) => ({
          ...f,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al actualizar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/users/me/avatar", formData);
      setUser({ ...user, avatar: res.data.user.avatar });
      toast.success("Avatar actualizado ✅");
    } catch (err) {
      toast.error("Error al subir imagen");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Ingresa tu contraseña");
      return;
    }

    try {
      await api.delete("/users/me", { data: { password: deletePassword } });
      window.location.href = "/";
    } catch (err) {
      toast.error(err.response?.data?.message || "Contraseña incorrecta");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold gradient-text mb-2">Mi Perfil</h1>
        <p className="text-gray-500">Administra tu información</p>
      </div>

      {/* Avatar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
            <label className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full cursor-pointer hover:bg-primary-600 transition-colors shadow-lg">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user?.name}</h3>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-gray-500">
                <strong className="text-gray-900 dark:text-gray-100">{stats.totalNotes}</strong> notas
              </span>
              <span className="text-gray-500">
                <strong className="text-gray-900 dark:text-gray-100">{stats.sharedWithMe}</strong> compartidas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-6">Información personal</h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nombre
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`input-field pl-12 ${errors.name ? "border-red-500" : ""}`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`input-field pl-12 ${errors.email ? "border-red-500" : ""}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-6">Cambiar contraseña</h3>
          <p className="text-sm text-gray-500 mb-4">
            Deja vacío si no quieres cambiar la contraseña
          </p>

          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Contraseña actual
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  placeholder="********"
                  className={`input-field pl-12 ${errors.currentPassword ? "border-red-500" : ""}`}
                />
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className={`input-field pl-12 ${errors.newPassword ? "border-red-500" : ""}`}
                />
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite la nueva contraseña"
                  className={`input-field pl-12 ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
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

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 mt-8">
        <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Zona de peligro
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <h3 className="text-lg font-bold mb-4">¿Eliminar cuenta?</h3>
            <p className="text-gray-500 mb-4">
              Esta acción es irreversible. Ingresa tu contraseña para confirmar.
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Tu contraseña"
              className="input-field mb-4"
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
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
}