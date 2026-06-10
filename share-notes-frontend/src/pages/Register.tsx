import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, LogOut } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';
import Button from '../components/ui/Button';
import NeuralBackground from '../components/ui/NeuralBackground';
import { showToast } from '../utils/toast';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-700 border-t-primary-500 rounded-full animate-spin" />
      <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse-subtle">Cargando...</p>
    </div>
  </div>
);

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, isCheckingAuth, logout, register, isLoading } = useAuthStore();
  const [form, setForm] = useState<RegisterForm>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string>('');

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) {
      if (err === 'account_not_found') {
        showToast('No encontramos una cuenta registrada con este correo de Google. Por favor, crea una cuenta primero.', 'error', { duration: 5000 });
      } else if (err === 'auth_error') {
        showToast('Hubo un error al autenticar con Google. Inténtalo de nuevo.', 'error');
      } else {
        showToast('Error de autenticación.', 'error');
      }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = 'Mínimo 2 caracteres';
    if (!form.email) errs.email = 'El email es requerido';
    if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((p) => ({ ...p, [name]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;
    setServerError('');
    const result = await register(form);
    if (result.ok) {
      showToast('¡Cuenta creada exitosamente!', 'success');
      navigate('/login');
    } else {
      const msg: string = result.message || 'Error al registrar';
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('ya está')) {
        setErrors((prev) => ({ ...prev, email: msg }));
      } else setServerError(msg);
      showToast(msg, 'error', { duration: 4000 });
    }
  };

  if (isCheckingAuth) return <LoadingScreen />;

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden animate-fade-in">
        <NeuralBackground />
        <div className="w-full max-w-md animate-slide-up z-10">
          <div className="card-neon">
            <div className="card-neon-inner p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4 animate-float">
                <span className="font-extrabold text-2xl text-white">SN</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text mb-2">Ya has iniciado sesión</h1>
              <p className="text-gray-500 dark:text-dark-400 mb-1">Estás conectado como</p>
              <p className="font-semibold text-gray-900 dark:text-white mb-6">{user.email}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/dashboard')} className="px-6">Ir al Dashboard</Button>
                <Button variant="secondary" onClick={async () => { await logout(); navigate('/login'); }} icon={LogOut}>Cerrar sesión</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <NeuralBackground />

      <div className="fixed inset-0 bg-gradient-to-br from-transparent via-purple-500/5 to-pink-500/5 dark:via-primary-950/10 dark:to-purple-950/10 pointer-events-none z-[1]" />

      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 group animate-slide-up"
      >
        <div className="p-1.5 rounded-lg group-hover:bg-white/60 dark:group-hover:bg-white/10 transition-all duration-200 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
        </div>
        <span className="font-medium text-sm">Volver</span>
      </Link>

      <div className="w-full max-w-[420px] relative z-10 animate-slide-up">
        <div className="card-neon">
          <div className="card-neon-inner p-8 md:p-9">
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute -top-[120%] -left-[120%] w-[300%] h-[300%] bg-gradient-to-br from-white/[0.07] via-transparent to-transparent rotate-12 animate-[shimmer_4s_ease-in-out_infinite]" />
            </div>

            <div className="flex flex-col items-center gap-4 mb-8 animate-slide-up delay-100">
              <div className="hex-logo animate-float">
                <div className="hex-logo-inner">
                  <span className="font-extrabold text-2xl bg-gradient-to-br from-primary-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">SN</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1.5 mb-8 animate-slide-up delay-200">
              <h1 className="text-2xl md:text-3xl font-extrabold gradient-text">Crear cuenta</h1>
              <p className="text-gray-500 dark:text-dark-400 font-medium text-sm">Únete a la comunidad de ShareNotes</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="relative group animate-slide-up delay-300">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 transition-all duration-200 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer input-field-floating pl-10 ${
                    errors.name
                      ? 'border-red-400 focus:ring-red-400/40'
                      : 'group-focus-within:border-primary-400 group-focus-within:ring-primary-400/25 dark:group-focus-within:ring-primary-400/15'
                  }`}
                  autoComplete="name"
                />
                <label
                  htmlFor="name"
                  className="floating-label peer-focus-within:text-primary-500 dark:peer-focus-within:text-primary-400 peer-focus-within:font-bold peer-focus-within:top-1.5 peer-focus-within:text-xs"
                  style={{ left: '2.5rem' }}
                >
                  Nombre completo
                </label>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1 animate-slide-up-fade">
                    <span className="scale-90">⚠</span> {errors.name}
                  </p>
                )}
              </div>

              <div className="relative group animate-slide-up delay-450">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 transition-all duration-200 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400" />
                <input
                  type="email"
                  id="reg-email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer input-field-floating pl-10 ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-400/40'
                      : 'group-focus-within:border-primary-400 group-focus-within:ring-primary-400/25 dark:group-focus-within:ring-primary-400/15'
                  }`}
                  autoComplete="email"
                />
                <label
                  htmlFor="reg-email"
                  className="floating-label peer-focus-within:text-primary-500 dark:peer-focus-within:text-primary-400 peer-focus-within:font-bold peer-focus-within:top-1.5 peer-focus-within:text-xs"
                  style={{ left: '2.5rem' }}
                >
                  Correo electrónico
                </label>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1 animate-slide-up-fade">
                    <span className="scale-90">⚠</span> {errors.email}
                  </p>
                )}
              </div>

              <div className="relative group animate-slide-up delay-500">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 transition-all duration-200 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reg-password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer input-field-floating pl-10 pr-12 ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-400/40'
                      : 'group-focus-within:border-primary-400 group-focus-within:ring-primary-400/25 dark:group-focus-within:ring-primary-400/15'
                  }`}
                  autoComplete="new-password"
                />
                <label
                  htmlFor="reg-password"
                  className="floating-label peer-focus-within:text-primary-500 dark:peer-focus-within:text-primary-400 peer-focus-within:font-bold peer-focus-within:top-1.5 peer-focus-within:text-xs"
                  style={{ left: '2.5rem' }}
                >
                  Contraseña
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

              {serverError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 animate-scale-in">
                  <span className="text-sm text-red-500 dark:text-red-400 font-semibold">{serverError}</span>
                </div>
              )}

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full py-3.5 text-base rounded-xl shadow-lg shadow-primary-500/25 dark:shadow-primary-500/10 hover:shadow-xl hover:shadow-primary-500/30 dark:hover:shadow-primary-500/15 transition-all duration-200 animate-slide-up delay-600"
              >
                Crear cuenta
              </Button>

              <>
                <div className="relative my-4 animate-slide-up delay-700">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200/80 dark:border-dark-700/80" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-5 bg-white/60 dark:bg-dark-900/60 backdrop-blur-sm text-gray-400 dark:text-dark-500 font-semibold rounded-full">
                        o continua con
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const base: string = import.meta.env.VITE_BACKEND_URL || '';
                      window.location.href = `${base}/api/auth/google?mode=register`;
                    }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white dark:bg-dark-800/80 backdrop-blur-sm border border-gray-200/80 dark:border-dark-700/80 rounded-xl hover:bg-gray-50/80 dark:hover:bg-dark-700/80 hover:border-gray-300 dark:hover:border-dark-600 hover:shadow-lg hover:shadow-gray-200/40 dark:hover:shadow-black/20 transition-all duration-200 active:scale-[0.98] animate-slide-up delay-700"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">Continuar con Google</span>
                  </button>
              </>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-dark-400 mt-6 font-medium animate-slide-up delay-750">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="font-extrabold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors relative group/inline"
              >
                Inicia sesión
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-purple-500 group-hover/inline:w-full transition-all duration-300 rounded-full" />
              </Link>
            </p>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Register;
