import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Shield, ArrowRight, Sparkles, Moon, Sun, GraduationCap, Users, FileText, LogOut, Zap, TrendingUp, Smartphone } from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode.js";
import useAuthStore from "../stores/useAuthStore";

const features = [
  { icon: GraduationCap, title: "Organiza tus estudios", desc: "Crea notas por materia con categorías de color", color: "from-primary-500 to-primary-600" },
  { icon: FileText, title: "Comparte conocimiento", desc: "Publica tus apuntes para que otros estudiantes puedan verlos", color: "from-blue-500 to-blue-600" },
  { icon: TrendingUp, title: "Seguimiento", desc: "Estadísticas y gráficas de tu progreso académico", color: "from-emerald-500 to-emerald-600" },
  { icon: Smartphone, title: "Acceso multidispositivo", desc: "Tus notas disponibles en cualquier lugar y dispositivo", color: "from-amber-500 to-amber-600" },
  { icon: Users, title: "Comunidad", desc: "Explora notas de otros usuarios y aprende en conjunto", color: "from-green-500 to-green-600" },
  { icon: Shield, title: "Seguro y privado", desc: "Tus notas están protegidas con JWT y cookies seguras", color: "from-pink-500 to-pink-600" },
];

const steps = [
  { num: "1", title: "Regístrate gratis", desc: "Crea tu cuenta en segundos", icon: Sparkles },
  { num: "2", title: "Crea tus notas", desc: "Organízalas por categorías", icon: FileText },
  { num: "3", title: "Comparte", desc: "Publica y ayuda a otros", icon: Users },
];

const Landing = () => {
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isCheckingAuth = useAuthStore((s) => s.isCheckingAuth);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isCheckingAuth, navigate]);

  const handleLogout = async () => { await logout(); navigate("/"); };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-700 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse-subtle">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[600px] h-[600px] bg-primary-400/10 rounded-full -top-48 -left-48 blur-3xl animate-float opacity-5" />
        <div className="absolute w-[500px] h-[500px] bg-purple-400/10 rounded-full top-1/2 -right-48 blur-3xl animate-float opacity-5" style={{ animationDelay: "2s" }} />
        <div className="absolute w-[400px] h-[400px] bg-blue-400/10 rounded-full -bottom-32 left-1/3 blur-3xl animate-float opacity-5" style={{ animationDelay: "4s" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(108,99,255,0.03),transparent_50%)]" />
      </div>

      <nav className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg gradient-text hidden sm:block">ShareNotes</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.05] text-slate-500 dark:text-slate-400 transition-all">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {isAuthenticated ? (
            <>
              <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">Hola, {user?.name}</span>
              <button onClick={() => navigate("/dashboard")} className="btn-primary px-4 py-2 text-sm">Ir a mi cuenta</button>
              <button onClick={handleLogout} className="px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><LogOut className="w-4 h-4" /></button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="btn-secondary px-4 py-2 text-sm">Ingresar</button>
              <button onClick={() => navigate("/register")} className="btn-primary px-4 py-2 text-sm">Regístrate gratis</button>
            </>
          )}
        </div>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-24 sm:pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 rounded-full mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-xs font-semibold text-primary-300">La mejor plataforma de notas académicas</span>
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight animate-slide-up">
          Tus notas,{" "}<span className="gradient-text">organizadas</span><br />y siempre contigo
        </h1>
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-12 animate-slide-up delay-100">
          Crea, organiza y comparte tus apuntes académicos. Con categorías de color, búsqueda inteligente y estadísticas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up delay-200">
          {isAuthenticated ? (
            <button onClick={() => navigate("/dashboard")} className="btn-primary px-8 py-4 text-base rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all flex items-center gap-2">
              Ir a mi cuenta <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/register")} className="btn-primary px-8 py-4 text-base rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all flex items-center gap-2">
                Empezar gratis <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate("/login")} className="btn-secondary px-8 py-4 text-base rounded-xl">Ya tengo cuenta</button>
            </>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-8 sm:gap-16 mt-16 animate-fade-in delay-300">
          {[
            { num: "1000+", label: "Estudiantes" }, { num: "500+", label: "Notas creadas" },
            { num: "50+", label: "Categorías" }, { num: "99%", label: "Satisfacción" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold gradient-text">{stat.num}</div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32">
        <div className="text-center mb-10 sm:mb-16">
          <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-400 text-xs font-semibold rounded-full mb-3">Características</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white mb-3">¿Por qué usar <span className="gradient-text">ShareNotes</span>?</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">Todo lo que necesitas para organizar tus estudios en un solo lugar</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <div key={i} className="card-hover p-6 cursor-default animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-1.5">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32">
        <div className="text-center mb-10 sm:mb-16">
          <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-semibold rounded-full mb-3">Cómo funciona</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white mb-3">Comienza en <span className="gradient-text">3 pasos</span></h2>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative flex flex-col items-center text-center group w-full md:w-56 cursor-pointer" onClick={() => navigate(step.num === "1" ? "/register" : (isAuthenticated ? "/dashboard" : "/login"))}>
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl shadow-primary-500/25 group-hover:scale-110 transition-all duration-300 mb-4">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-slate-200 dark:bg-[#0d0b1f] rounded-full flex items-center justify-center font-bold text-xs text-primary-400 dark:text-primary-400 border border-slate-300 dark:border-white/[0.08]">
                  {step.num}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-1">{step.title}</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">{step.desc}</p>
                {i < steps.length - 1 && <ArrowRight className="hidden md:block absolute -right-6 top-6 w-5 h-5 text-slate-400 dark:text-slate-600" />}
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32">
        <div className="bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_50%)]" />
          <div className="relative z-10">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-4 text-white/80 animate-pulse-subtle" />
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 text-white">¿Listo para empezar?</h2>
            <p className="text-white/80 mb-6 sm:mb-8 text-sm sm:text-base max-w-md mx-auto">Únete a miles de estudiantes que ya organizan sus notas con ShareNotes</p>
            <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-primary-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-xl text-sm sm:text-base">
              <Zap className="w-4 h-4" /> Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-200 dark:border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-400" /> <span>ShareNotes</span>
          </div>
          <p>Hecho con ❤️ para estudiantes</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
