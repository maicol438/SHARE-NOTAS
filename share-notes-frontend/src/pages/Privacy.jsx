import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Shield, ArrowLeft } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary-400 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Volver al inicio</span>
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl gradient-text">ShareNotes</span>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary-400" />
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">Política de Privacidad</h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-500">Última actualización: 20 de mayo de 2026</p>
          </div>

          <div className="bg-white dark:bg-[#0d0b1f] border border-slate-200 dark:border-white/[0.06] rounded-xl p-6 sm:p-8 space-y-6">
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Introducción</h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">En ShareNotes, nos tomamos muy en serio tu privacidad. Esta política describe cómo recopilamos, usamos y protegemos tu información cuando utilizas nuestra plataforma.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Datos que recopilamos</h2>
              <ul className="list-disc list-inside text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
                <li>Información de tu cuenta (nombre, correo electrónico, foto de perfil) proporcionada al registrarte o mediante Google OAuth.</li>
                <li>Notas, apuntes y archivos que creas y subes a la plataforma.</li>
                <li>Datos de uso básicos para mejorar la experiencia (estadísticas anónimas de navegación).</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Uso de Google Services</h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Esta aplicación utiliza <strong>Google Docs</strong> para guardar tus notas y <strong>Gmail</strong> para enviarlas cuando así lo solicites. Solo accedemos a estos servicios con tu permiso explícito y únicamente para las funcionalidades que tú activas.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Compartición de datos</h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Tus datos no son compartidos con terceros. La información que publicas como nota pública es visible para otros usuarios dentro de la plataforma, pero nunca vendemos ni cedemos tus datos personales a terceros.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Seguridad</h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Tus datos están protegidos mediante autenticación JWT, cookies seguras y cifrado en tránsito (HTTPS). Implementamos las mejores prácticas de seguridad para proteger tu información.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Contacto</h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Si tienes preguntas sobre esta política de privacidad, puedes contactarnos a través de los canales disponibles en la plataforma.</p>
            </section>
          </div>

          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Volver a ShareNotes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
