import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, BookOpen, ArrowLeft, CheckCircle } from "lucide-react";
import api from "../api/axios";
import { showToast } from "../utils/toast.jsx";
import Button from "../components/ui/Button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { showToast("Ingresa tu email", "error"); return; }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-gray-50 to-gray-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 relative overflow-hidden">
      <Link to="/login" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-all group">
        <div className="p-1.5 rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-dark-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="font-medium">Volver</span>
      </Link>

      <div className="w-full max-w-md animate-slide-up">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Recuperar contraseña</h1>
          <p className="text-gray-500 text-center">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center animate-scale-in">
              <div className="w-14 h-14 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Se ha enviado un enlace de restablecimiento a tu correo electrónico. Por favor, revisa tu bandeja de entrada.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu email" className="input-field-floating pl-10" required />
              </div>
              <Button type="submit" isLoading={loading} className="w-full py-3">Enviar enlace</Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
