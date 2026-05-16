import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, BookOpen, ArrowLeft, CheckCircle } from "lucide-react";
import api from "../api/axios";
import { showToast } from "../utils/toast.jsx";
import Button from "../components/ui/Button";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { showToast("Mínimo 6 caracteres", "error"); return; }
    if (password !== confirm) { showToast("Las contraseñas no coinciden", "error"); return; }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      showToast("Contraseña actualizada", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-gray-50 to-gray-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
        <div className="card p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">Contraseña actualizada</h1>
          <p className="text-gray-500 mb-6">Ahora puedes iniciar sesión con tu nueva contraseña</p>
          <Button onClick={() => navigate("/login")} className="w-full">Iniciar sesión</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-gray-50 to-gray-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      <Link to="/login" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-all group">
        <div className="p-1.5 rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-dark-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="font-medium">Volver</span>
      </Link>
      <div className="card p-8 max-w-md w-full animate-slide-up">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Nueva contraseña</h1>
          <p className="text-gray-500">Ingresa tu nueva contraseña</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nueva contraseña" className="input-field-floating pl-10" minLength={6} required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirmar contraseña" className="input-field-floating pl-10" minLength={6} required />
          </div>
          <Button type="submit" isLoading={loading} className="w-full py-3">Restablecer contraseña</Button>
        </form>
      </div>
    </div>
  );
}
