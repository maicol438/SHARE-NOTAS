import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, LogOut, StickyNote, Sparkles } from "lucide-react";
import useAuthStore from "../stores/useAuthStore.js";
import Button from "../components/ui/Button.jsx";
import { showToast } from "../utils/toast.jsx";
import api from "../api/axios.js";

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-surface-700 border-t-primary-500 rounded-full animate-spin" />
      <p className="text-surface-500 text-sm animate-pulse-subtle">Cargando...</p>
    </div>
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isCheckingAuth, logout, register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    api.get("/health").then((res) => setGoogleEnabled(res.data?.features?.googleAuth || false)).catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = "Mínimo 2 caracteres";
    if (!form.email) errs.email = "El email es requerido";
    if (form.password.length < 6) errs.password = "Mínimo 6 caracteres";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setServerError("");
    const result = await register(form);
    if (result.ok) {
      showToast("¡Cuenta creada exitosamente!", "success");
      navigate("/login");
    } else {
      const msg = result.message || "Error al registrar";
      if (msg.toLowerCase().includes("email") || msg.toLowerCase().includes("ya está")) {
        setErrors((prev) => ({ ...prev, email: msg }));
      } else setServerError(msg);
      showToast(msg, "error", { duration: 4000 });
    }
  };

  if (isCheckingAuth) return <LoadingScreen />;

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface-950">
        <div className="w-full max-w-sm bg-surface-900 border border-surface-800 rounded-xl p-8 text-center">
          <div className="w-14 h-14 mx-auto bg-primary-500 rounded-2xl flex items-center justify-center mb-5">
            <StickyNote className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-surface-100 mb-1">Ya has iniciado sesión</h1>
          <p className="text-sm text-surface-500 mb-1">Estás conectado como</p>
          <p className="font-medium text-surface-300 mb-6">{user.email}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/dashboard")}>Ir al Dashboard</Button>
            <Button variant="secondary" onClick={async () => { await logout(); navigate("/login"); }} icon={LogOut}>Cerrar sesión</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-950 relative overflow-hidden">
      <Link to="/" className="absolute top-5 left-5 z-20 flex items-center gap-2 text-surface-500 hover:text-surface-300 transition-all">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Volver</span>
      </Link>

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
            <StickyNote className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-surface-100">Crear cuenta</h1>
          <p className="text-sm text-surface-500">Únete a la comunidad</p>
        </div>

        <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 z-10" />
              <input type="text" id="name" name="name" value={form.name} onChange={handleChange} placeholder=" "
                className={`peer input-field-floating pl-9 ${errors.name ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : ""}`} autoComplete="name" />
              <label htmlFor="name" className="floating-label" style={{ left: "2.25rem" }}>Nombre completo</label>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 z-10" />
              <input type="email" id="reg-email" name="email" value={form.email} onChange={handleChange} placeholder=" "
                className={`peer input-field-floating pl-9 ${errors.email ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : ""}`} autoComplete="email" />
              <label htmlFor="reg-email" className="floating-label" style={{ left: "2.25rem" }}>Correo electrónico</label>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 z-10" />
              <input type={showPassword ? "text" : "password"} id="reg-password" name="password" value={form.password}
                onChange={handleChange} placeholder=" "
                className={`peer input-field-floating pl-9 pr-10 ${errors.password ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                autoComplete="new-password" />
              <label htmlFor="reg-password" className="floating-label" style={{ left: "2.25rem" }}>Contraseña</label>
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors p-0.5">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {serverError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                <span className="text-sm text-red-400">{serverError}</span>
              </div>
            )}

            <Button type="submit" isLoading={isLoading} className="w-full mt-1">Crear cuenta</Button>

            {googleEnabled && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-800" /></div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-surface-900 text-surface-500">o continúa con</span>
                  </div>
                </div>
                <button type="button"
                  onClick={() => { const base = import.meta.env.VITE_BACKEND_URL || ''; window.location.href = `${base}/api/auth/google`; }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-surface-850 border border-surface-700 rounded-lg hover:bg-surface-800 transition-all active:scale-[0.98]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium text-surface-300">Continuar con Google</span>
                </button>
              </>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-surface-500 mt-5">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
