import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, BookOpen, Eye, EyeOff, ArrowLeft, LogOut } from "lucide-react";
import useAuthStore from "../stores/useAuthStore.js";
import Button from "../components/ui/Button.jsx";
import { showToast } from "../utils/toast.jsx";
import api, { API_BASE } from "../api/axios.js";

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-primary-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-500 animate-pulse font-medium">Cargando...</p>
    </div>
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isCheckingAuth, logout, login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    api.get("/health").then((res) => {
      setGoogleEnabled(res.data?.features?.googleAuth || false);
    }).catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "El email es requerido";
    if (!form.password) errs.password = "La contraseña es requerida";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(form);
    if (result.ok) {
      showToast("¡Bienvenido de vuelta!", "success");
      navigate("/dashboard");
    } else {
      showToast(result.message || "Credenciales incorrectas", "error");
    }
  };

  if (isCheckingAuth) return <LoadingScreen />;

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-gray-50 to-gray-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 relative overflow-hidden animate-fade-in">
        <div className="w-full max-w-md animate-slide-up">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-2">Ya has iniciado sesión</h1>
            <p className="text-gray-500 dark:text-dark-400 mb-1">Estás conectado como</p>
            <p className="font-semibold text-gray-900 dark:text-white mb-6">{user.email}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/dashboard")} className="px-6">Ir al Dashboard</Button>
              <Button variant="secondary" onClick={async () => { await logout(); navigate("/login"); }} icon={LogOut}>Cerrar sesión</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-gray-50 to-gray-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 relative overflow-hidden animate-fade-in">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      <Link to="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all group">
        <div className="p-1.5 rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-dark-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="font-medium">Volver</span>
      </Link>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 animate-float">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Bienvenido</h1>
          <p className="text-gray-500 dark:text-dark-400">Ingresa a tu cuenta para continuar</p>
        </div>

        <div className="card p-8 border-primary-100/50 dark:border-primary-900/20">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder=" "
                className={`peer input-field-floating pl-10 ${errors.email ? "border-red-400 focus:ring-red-400/30" : ""}`}
                autoComplete="email"
              />
              <label htmlFor="email" className="floating-label" style={{ left: "2.5rem" }}>
                Correo electrónico
              </label>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder=" "
                className={`peer input-field-floating pl-10 pr-12 ${errors.password ? "border-red-400 focus:ring-red-400/30" : ""}`}
                autoComplete="current-password"
              />
              <label htmlFor="password" className="floating-label" style={{ left: "2.5rem" }}>
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-dark-300 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
            </div>

            <div className="flex justify-end -mt-2">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full py-3 text-base rounded-xl">
              Ingresar
            </Button>

            {googleEnabled && (
              <>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-dark-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-dark-900 text-dark-400 font-medium">o continúa con</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.location.href = `${API_BASE}/api/auth/google`}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-dark-700 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-800 transition-all active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-semibold text-gray-700 dark:text-dark-300">Continuar con Google</span>
                </button>
                <p className="text-[11px] text-gray-400 text-center leading-tight">
                  ¿Registraste con Google? Solo haz clic arriba, no necesitas contraseña.
                </p>
              </>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-dark-400 mt-6">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
