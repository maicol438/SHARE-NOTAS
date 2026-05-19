import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Shield, ArrowRight, Sparkles, Moon, Sun, GraduationCap, Users, FileText, LogOut, Zap, TrendingUp, Smartphone } from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode.js";
import useAuthStore from "../stores/useAuthStore";

const features = [
  { icon: GraduationCap, title: "Organiza tus estudios", desc: "Crea notas por materia con categorías de color", color: "from-purple-500 to-purple-600", shadow: "shadow-purple-500/25" },
  { icon: FileText, title: "Comparte conocimiento", desc: "Publica tus apuntes para que otros estudiantes puedan verlos", color: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/25" },
  { icon: TrendingUp, title: "Seguimiento", desc: "Estadísticas y gráficas de tu progreso académico", color: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-500/25" },
  { icon: Smartphone, title: "Acceso multidispositivo", desc: "Tus notas disponibles en cualquier lugar y dispositivo", color: "from-amber-500 to-amber-600", shadow: "shadow-amber-500/25" },
  { icon: Users, title: "Comunidad", desc: "Explora notas de otros usuarios y aprende en conjunto", color: "from-green-500 to-green-600", shadow: "shadow-green-500/25" },
  { icon: Shield, title: "Seguro y privado", desc: "Tus notas están protegidas con JWT y cookies seguras", color: "from-pink-500 to-pink-600", shadow: "shadow-pink-500/25" },
];

const steps = [
  { num: "1", title: "Regístrate gratis", desc: "Crea tu cuenta en segundos", icon: Sparkles },
  { num: "2", title: "Crea tus notas", desc: "Organízalas por categorías", icon: FileText },
  { num: "3", title: "Comparte", desc: "Publica y ayuda a otros", icon: Users },
];

const FloatingShape = ({ className }) => (
  <div className={`absolute rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 ${className}`} />
);

const Landing = () => {
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FloatingShape className="w-[600px] h-[600px] bg-primary-400 -top-48 -left-48 animate-float" />
        <FloatingShape className="w-[500px] h-[500px] bg-purple-400 top-1/2 -right-48 animate-float delay-200" />
        <FloatingShape className="w-[400px] h-[400px] bg-blue-400 -bottom-32 left-1/3 animate-float delay-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.03),transparent_50%)]" />
      </div>

      <nav className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer flex-shrink-0" onClick={() => navigate("/")}>
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-all duration-300 group-hover:scale-105">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl gradient-text hidden xs:block">ShareNotes</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={toggle} className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all hover:scale-105">
            {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Hola, {user?.name}</span>
              <button onClick={() => navigate("/dashboard")} className="btn-primary px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap">
                Ir a mi cuenta
              </button>
              <button onClick={handleLogout} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-all text-xs sm:text-sm">
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="btn-secondary px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap">
                Ingresar
              </button>
              <button onClick={() => navigate("/register")} className="btn-primary px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap">
                Regístrate gratis
              </button>
            </>
          )}
        </div>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-24 sm:pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 rounded-full mb-6 sm:mb-8 shadow-sm animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400" />
          <span className="text-xs sm:text-sm font-semibold text-primary-700 dark:text-primary-300">La mejor plataforma de notas académicas</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold mb-4 sm:mb-6 leading-tight animate-slide-up">
          Tus notas,{" "}
          <span className="gradient-text">organizadas</span>
          <br className="hidden sm:block" />y siempre contigo
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-12 animate-slide-up delay-100 px-2">
          Crea, organiza y comparte tus apuntes académicos. 
          Con categorías de color, búsqueda inteligente y estadísticas de progreso.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-slide-up delay-200 px-4 sm:px-0">
          {isAuthenticated ? (
            <button onClick={() => navigate("/dashboard")} className="group btn-primary px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg rounded-2xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300 hover:scale-[1.02]">
              <span>Ir a mi cuenta</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/register")} className="group btn-primary px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg rounded-2xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300 hover:scale-[1.02]">
                <span>Empezar gratis</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
              <button onClick={() => navigate("/login")} className="btn-secondary px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg rounded-2xl hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-dark-800 transition-all duration-300 hover:scale-[1.02]">
                Ya tengo cuenta
              </button>
            </>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mt-16 sm:mt-20 animate-fade-in delay-300">
          {[
            { num: "1000+", label: "Estudiantes" },
            { num: "500+", label: "Notas creadas" },
            { num: "50+", label: "Categorías" },
            { num: "99%", label: "Satisfacción" },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text group-hover:scale-110 transition-transform duration-300">{stat.num}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32">
        <div className="text-center mb-10 sm:mb-16">
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4">Características</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4">¿Por qué usar <span className="gradient-text">ShareNotes</span>?</h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto px-2">Todo lo que necesitas para organizar tus estudios en un solo lugar</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map(({ icon: Icon, title, desc, color, shadow }, i) => (
            <div key={i} className="group card p-7 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-default animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-5 shadow-lg ${shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32">
        <div className="text-center mb-10 sm:mb-16">
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4">Cómo funciona</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4">Comienza en <span className="gradient-text">3 pasos</span></h2>
          <p className="text-gray-500 text-base sm:text-lg">Es más fácil de lo que imaginas</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative flex flex-col items-center text-center group w-full md:w-64">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/25 group-hover:shadow-primary-500/40 group-hover:scale-110 transition-all duration-300 mb-5">
                  <Icon className="w-9 h-9 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-dark-900 rounded-full flex items-center justify-center font-bold text-sm text-primary-600 dark:text-primary-400 shadow-md border-2 border-primary-100 dark:border-primary-900">
                  {step.num}
                </div>
                <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-6 top-10 w-6 h-6 text-gray-300 dark:text-gray-600" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32">
        <div className="card p-6 sm:p-10 md:p-14 text-center bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_50%)]" />

          <div className="relative z-10">
            <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 sm:mb-6 text-white/80 animate-bounce-subtle" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4">¿Listo para empezar?</h2>
            <p className="text-white/80 mb-6 sm:mb-10 text-base sm:text-lg max-w-md mx-auto">Únete a miles de estudiantes que ya organizan sus notas con ShareNotes</p>
            <Link to="/register" className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-white text-primary-600 font-bold rounded-xl sm:rounded-2xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-white/30 text-base sm:text-lg">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-gray-200 dark:border-gray-800 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <BookOpen className="w-4 h-4 text-primary-500" />
            <span>ShareNotes by <strong>Maicol438</strong></span>
          </div>
          <p className="text-gray-400 text-sm">Hecho con ❤️ para estudiantes</p>
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <span className="hover:text-primary-500 transition-colors cursor-pointer">Términos</span>
            <span className="hover:text-primary-500 transition-colors cursor-pointer">Privacidad</span>
            <span className="hover:text-primary-500 transition-colors cursor-pointer">Contacto</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
