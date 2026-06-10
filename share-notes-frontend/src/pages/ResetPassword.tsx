import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, BookOpen, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { showToast } from '../utils/toast';
import Button from '../components/ui/Button';

interface FormErrors {
  password?: string;
  confirm?: string;
}

interface Particle {
  left: string;
  top: string;
  size: number;
  opacity: number;
  delay: string;
  color: string;
}

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>('');
  const [confirm, setConfirm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (password.length < 6) {
      errs.password = 'Mínimo 6 caracteres';
    }
    if (password !== confirm) {
      errs.confirm = 'Las contraseñas no coinciden';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      showToast('Contraseña actualizada con éxito', 'success');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message || 'Error al restablecer la contraseña';
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

            {done ? (
              <div className="text-center animate-scale-in py-4">
                <div className="w-16 h-16 mx-auto bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-5 animate-pulse">
                  <CheckCircle className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">¡Contraseña restablecida!</h3>
                <p className="text-sm text-gray-500 dark:text-dark-400 px-2 leading-relaxed mb-8">
                  Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tus nuevas credenciales.
                </p>
                <Button onClick={() => navigate('/login')} className="w-full">Iniciar sesión</Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-2 mb-8">
                  <h1 className="text-2xl md:text-3xl font-extrabold gradient-text">Nueva contraseña</h1>
                  <p className="text-gray-500 dark:text-dark-400 font-medium text-sm px-2">
                    Ingresa tu nueva contraseña para actualizar el acceso
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left" noValidate>
                  <div className="relative group animate-slide-up">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 transition-all duration-200 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors(p => ({ ...p, password: '' }));
                      }}
                      placeholder=" "
                      className={`peer input-field-floating pl-10 pr-12 ${
                        errors.password
                          ? 'border-red-400 focus:ring-red-400/40'
                          : 'group-focus-within:border-primary-400 group-focus-within:ring-primary-400/25 dark:group-focus-within:ring-primary-400/15'
                      }`}
                      autoComplete="new-password"
                    />
                    <label
                      htmlFor="password"
                      className="floating-label peer-focus-within:text-primary-500 dark:peer-focus-within:text-primary-400 peer-focus-within:font-bold peer-focus-within:top-1.5 peer-focus-within:text-xs"
                      style={{ left: '2.5rem' }}
                    >
                      Nueva contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1 animate-slide-up-fade">
                        <span className="scale-90">⚠</span> {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="relative group animate-slide-up">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 transition-all duration-200 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm"
                      name="confirm"
                      value={confirm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setConfirm(e.target.value);
                        if (errors.confirm) setErrors(p => ({ ...p, confirm: '' }));
                      }}
                      placeholder=" "
                      className={`peer input-field-floating pl-10 pr-12 ${
                        errors.confirm
                          ? 'border-red-400 focus:ring-red-400/40'
                          : 'group-focus-within:border-primary-400 group-focus-within:ring-primary-400/25 dark:group-focus-within:ring-primary-400/15'
                      }`}
                      autoComplete="new-password"
                    />
                    <label
                      htmlFor="confirm"
                      className="floating-label peer-focus-within:text-primary-500 dark:peer-focus-within:text-primary-400 peer-focus-within:font-bold peer-focus-within:top-1.5 peer-focus-within:text-xs"
                      style={{ left: '2.5rem' }}
                    >
                      Confirmar contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {errors.confirm && (
                      <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1 animate-slide-up-fade">
                        <span className="scale-90">⚠</span> {errors.confirm}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    isLoading={loading}
                    className="w-full py-3.5 text-base rounded-xl shadow-lg shadow-primary-500/25 dark:shadow-primary-500/10 hover:shadow-xl hover:shadow-primary-500/30 dark:hover:shadow-primary-500/15 transition-all duration-200"
                  >
                    Restablecer contraseña
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
