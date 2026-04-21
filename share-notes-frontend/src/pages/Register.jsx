import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, BookOpen, Eye, EyeOff, ArrowLeft, Sparkles } from "lucide-react";
import useAuthStore from "../stores/useAuthStore.js";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register(form);
    if (result.ok) {
      toast.success(`🎉 ¡Cuenta creada! Bienvenido, ${form.name.split(" ")[0]}!`, {
        icon: "🎊",
        style: { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "12px", color: "white" },
      });
      navigate("/dashboard");
    } else {
      toast.error(`❌ ${result.message || "No se pudo crear la cuenta. Intenta de nuevo."}`, {
        style: { background: "#ef4444", borderRadius: "12px", color: "white" },
      });
    }
  };

  const inputClasses = (name) => `
    input-field pl-12 transition-all duration-300
    ${focused === name ? "ring-2 ring-primary-500 border-primary-500 scale-[1.02]" : ""}
    ${errors[name] ? "border-red-500 ring-2 ring-red-500" : ""}
  `;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float delay-200" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-float delay-300" />
      </div>

      {/* Back button */}
      <Link to="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Volver</span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8 animate-slide-up">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/30 animate-pulse-glow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Crear cuenta</h1>
          <p className="text-gray-500 dark:text-gray-400">Únete a la comunidad</p>
        </div>

        <div className="card p-8 shadow-2xl animate-scale-in delay-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name */}
            <div className="relative">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${focused === "name" || form.name ? "top-3 -translate-y-0 text-xs" : ""} ${focused === "name" ? "text-primary-600" : "text-gray-400"}`}>
                {focused === "name" || form.name ? "Nombre completo" : <User className="w-5 h-5" />}
              </div>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
                placeholder={focused === "name" || form.name ? "" : "Ana García"}
                className={inputClasses("name")}
                autoComplete="name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="relative">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${focused === "email" || form.email ? "top-3 -translate-y-0 text-xs" : ""} ${focused === "email" ? "text-primary-600" : "text-gray-400"}`}>
                {focused === "email" || form.email ? "Email" : <Mail className="w-5 h-5" />}
              </div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder={focused === "email" || form.email ? "" : "ana@email.com"}
                className={inputClasses("email")}
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${focused === "password" || form.password ? "top-3 -translate-y-0 text-xs" : ""} ${focused === "password" ? "text-primary-600" : "text-gray-400"}`}>
                {focused === "password" || form.password ? "Contraseña" : <Lock className="w-5 h-5" />}
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder={focused === "password" || form.password ? "" : "••••••••"}
                className={`${inputClasses("password")} pr-12`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2 py-3 text-lg rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40">
              Crear cuenta
            </Button>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-gray-900 text-gray-400">o continúa con</span>
              </div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/google`}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium">Continuar con Google</span>
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 animate-fade-in delay-200">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-primary-600 hover:underline font-medium hover:text-primary-700">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;