import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, BookOpen, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { showToast } from '../utils/toast';
import Button from '../components/ui/Button';

interface Particle {
  left: string;
  top: string;
  size: number;
  opacity: number;
  delay: string;
  color: string;
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!email) {
      setError('El email es requerido');
      showToast('Ingresa tu email', 'error');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      showToast('Enlace enviado con éxito', 'success');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message || 'Error al enviar el enlace';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const particles: Particle[] = [
    { left: '10%', top: '8%', size: 160, opacity: 0.2, delay: '0.2s', color: 'bg-primary-400/40 dark:bg-primary-500/20' },
    { left: '80%', top: '15%', size: 150, opacity: 0.18, delay: '0.8s', color: 'bg-purple-400/40 dark:bg-purple-500/20' },
    { left: '5%', top: '70%', size: 200, opacity: 0.15, delay: '0.4s', color: 'bg-pink-400/30 dark:bg-pink-500/15' },
    { left: '85%', top: '75%', size: 170, opacity: 0.16, delay: '1.2s', color: 'bg-indigo-400/30 dark:bg-indigo-500/15' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-purple-50/40 to-pink-50/30 dark:from-dark-950 dark:via-primary-950/20 dark:to-purple-950/20 relative overflow-hidden">
      {particles.map((p: Particle, i: number) => (
        <div
          key={i}
          className={`absolute rounded-full blur-3xl animate-float-particle pointer-events-none ${p.color}`}
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: p.left,
            opacity: p.opacity,
            animationDelay: p.delay,
          }}
        />
      ))}

      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <Link
        to="/login"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 group animate-slide-up"
      >
        <div className="p-1.5 rounded-lg group-hover:bg-white/60 dark:group-hover:bg-white/10 transition-all duration-200 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
        </div>
        <span className="font-medium text-sm">Volver</span>
      </Link>

      <div className="w-full max-w-[420px] relative z-10 animate-slide-up">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/30 via-purple-500/20 to-pink-500/30 dark:from-primary-500/15 dark:via-purple-500/10 dark:to-pink-500/15 rounded-3xl blur-2xl opacity-60" />

          <div className="relative bg-white/80 dark:bg-dark-900/80 backdrop-blur-2xl border border-white/60 dark:border-white/[0.06] rounded-3xl shadow-2xl shadow-primary-500/[0.08] dark:shadow-primary-500/[0.04] p-8 md:p-9 text-center">
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute -top-[120%] -left-[120%] w-[300%] h-[300%] bg-gradient-to-br from-white/[0.07] via-transparent to-transparent rotate-12 animate-[shimmer_4s_ease-in-out_infinite]" />
            </div>

            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500 rounded-2xl opacity-40 blur-xl group-hover:opacity-60 transition-opacity duration-500 animate-pulse-glow" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/40 animate-float">
                  <BookOpen className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 mb-8">
              <h1 className="text-2xl md:text-3xl font-extrabold gradient-text">Recuperar contraseña</h1>
              <p className="text-gray-500 dark:text-dark-400 font-medium text-sm px-2">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
              </p>
            </div>

            {sent ? (
              <div className="text-center animate-scale-in py-4">
                <div className="w-16 h-16 mx-auto bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-5 animate-pulse">
                  <CheckCircle className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">¡Enlace enviado!</h3>
                <p className="text-sm text-gray-500 dark:text-dark-400 px-2 leading-relaxed">
                  Se ha enviado un enlace de restablecimiento a <span className="font-semibold text-primary-500 dark:text-primary-400">{email}</span>.
                </p>
                <Link to="/login" className="mt-8 block">
                  <Button className="w-full">Volver a iniciar sesión</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left" noValidate>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 transition-all duration-200 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder=" "
                    className={`peer input-field-floating pl-10 ${
                      error
                        ? 'border-red-400 focus:ring-red-400/40'
                        : 'group-focus-within:border-primary-400 group-focus-within:ring-primary-400/25 dark:group-focus-within:ring-primary-400/15'
                    }`}
                    autoComplete="email"
                  />
                  <label
                    htmlFor="email"
                    className="floating-label peer-focus-within:text-primary-500 dark:peer-focus-within:text-primary-400 peer-focus-within:font-bold peer-focus-within:top-1.5 peer-focus-within:text-xs"
                    style={{ left: '2.5rem' }}
                  >
                    Correo electrónico
                  </label>
                  {error && (
                    <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1 animate-slide-up-fade">
                      <span className="scale-90">⚠</span> {error}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full py-3.5 text-base rounded-xl shadow-lg shadow-primary-500/25 dark:shadow-primary-500/10 hover:shadow-xl hover:shadow-primary-500/30 dark:hover:shadow-primary-500/15 transition-all duration-200"
                >
                  Enviar enlace
                </Button>
              </form>
            )}

            {!sent && (
              <p className="text-center text-sm text-gray-500 dark:text-dark-400 mt-6 font-medium">
                ¿Recordaste tu contraseña?{' '}
                <Link
                  to="/login"
                  className="font-extrabold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors relative group/inline"
                >
                  Inicia sesión
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-purple-500 group-hover/inline:w-full transition-all duration-300 rounded-full" />
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
