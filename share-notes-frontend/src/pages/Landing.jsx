import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Shield, Zap, Tag, Star, ArrowRight, Check, Sparkles } from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode.js";
import { Moon, Sun, GraduationCap, Users, FileText, Lock } from "lucide-react";

const features = [
  { icon: GraduationCap, title: "Organiza tus estudios", desc: "Crea notas por materia con categorías de color", color: "bg-purple-500" },
  { icon: FileText, title: "Comparte conocimiento", desc: "Publica tus apuntes para que otros estudiantes puedan verlos", color: "bg-blue-500" },
  { icon: Users, title: "Comunidad", desc: "Explora notas de otros usuarios y aprende insieme", color: "bg-green-500" },
  { icon: Shield, title: "Seguro y privado", desc: "Tus notas están protegidas con JWT y cookies seguras", color: "bg-pink-500" },
];

const steps = [
  { num: "1", title: "Regístrate gratis", desc: "Crea tu cuenta en segundos" },
  { num: "2", title: "Crea tus notas", desc: "Organízalas por categorías" },
  { num: "3", title: "Comparte", desc: "Publica y ayuda a otros" },
];

const Landing = () => {
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();
  
  const handleRegister = () => navigate("/register");
  const handleLogin = () => navigate("/login");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float delay-200" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float delay-300" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">ShareNotes</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all duration-300 hover:rotate-12">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={handleLogin} className="btn-secondary px-5 py-2.5 rounded-xl font-medium cursor-pointer">
            Ingresar
          </button>
          <button onClick={handleRegister} className="btn-primary px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-500/30 cursor-pointer">
            Regístrate gratis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-900/40 dark:to-purple-900/40 rounded-full mb-8 animate-slide-up">
          <Sparkles className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">La mejor plataforma de notas académicas</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up delay-100">
          Tus notas,{" "}
          <span className="gradient-text">organizadas</span>
          <br />y siempre contigo
        </h1>
        
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up delay-200">
          Crea, organiza y comparte tus apuntes académicos. 
          Con categorías de color, búsqueda rápida y modo lectura inmersiva.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-300">
          <button onClick={handleRegister} className="group btn-primary px-8 py-4 text-lg rounded-2xl shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/40 cursor-pointer">
            <span>Empezar gratis</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={handleLogin} className="btn-secondary px-8 py-4 text-lg rounded-2xl cursor-pointer">
            Ya tengo cuenta
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 animate-slide-up delay-400">
          {[
            { num: "1000+", label: "Estudiantes" },
            { num: "500+", label: "Notas creadas" },
            { num: "50+", label: "Categorías" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold gradient-text">{stat.num}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">¿Por qué usar <span className="gradient-text">ShareNotes</span>?</h2>
          <p className="text-gray-500">Todo lo que necesitas para organizar tus estudios</p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <div 
              key={i} 
              className="card p-6 text-center hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">¿Cómo <span className="gradient-text">funciona</span>?</h2>
          <p className="text-gray-500">En solo 3 pasos</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6">
          {steps.map((step, i) => (
            <div 
              key={i} 
              className="flex items-center gap-4 card p-5 px-6 animate-slide-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {step.num}
              </div>
              <div className="text-left">
                <div className="font-semibold">{step.title}</div>
                <div className="text-sm text-gray-500">{step.desc}</div>
              </div>
              {i < steps.length - 1 && <ArrowRight className="w-5 h-5 text-gray-300 hidden sm:block" />}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="card p-12 text-center bg-gradient-to-br from-primary-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
            <p className="text-primary-100 mb-8 text-lg">Únete a miles de estudiantes que ya organizan sus notas</p>
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl">
              <Star className="w-5 h-5" />
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>© 2026 ShareNotes. Hecho con ❤️ para estudiantes.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;