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
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-950 relative overflow-hidden">
      <Link to="/login" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-surface-400 hover:text-surface-200 transition-all group">
        <div className="p-1.5 rounded-lg group-hover:bg-surface-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="font-medium">Volver</span>
      </Link>

      <div className="w-full max-w-md animate-slide-up">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-surface-100">Recuperar contraseña</h1>
          <p className="text-surface-500 text-sm text-center">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña</p>
        </div>

        <div className="bg-surface-900 border border-surface-800/60 rounded-xl p-6">
          {sent ? (
            <div className="text-center animate-scale-in">
              <div className="w-14 h-14 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
              <p className="font-medium text-surface-200 text-sm">
                Se ha enviado un enlace de restablecimiento a tu correo electrónico.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 z-10" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu email" className="input-field pl-9" required />
              </div>
              <Button type="submit" isLoading={loading} className="w-full">Enviar enlace</Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-surface-500 mt-5">
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
