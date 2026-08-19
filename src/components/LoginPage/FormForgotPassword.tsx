import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import mail from "../../assets/email_icon.png";
import lock from "../../assets/lock_icon.png";
import ticket from "../../assets/ticket_icon.png";
import {
  forgotPassword,
  normalizeApiError,
  resetPassword,
} from "../../api/password";

const CODE_TTL_SECONDS = 15 * 60; // 15 min (EMAIL_RESET_CODE_TTL_MIN)

const formatTimer = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const FormForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Cuenta regresiva de validez del código.
  useEffect(() => {
    if (step !== 2 || secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [step, secondsLeft]);

  // Paso 1 — solicitar código.
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Ingresa un correo válido.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      // Mensaje SIEMPRE genérico: no revelamos si el correo existe.
      setInfo("Si el correo está registrado, recibirás un código de 6 dígitos.");
      setStep(2);
      setSecondsLeft(CODE_TTL_SECONDS);
    } catch (err) {
      setError(
        normalizeApiError(
          err,
          "No se pudo enviar el código. Intenta de nuevo en un momento.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  // Paso 2 — confirmar nueva contraseña.
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    // Validación espejo de las reglas del backend.
    if (!/^\d{6}$/.test(code)) {
      setError("El código debe tener exactamente 6 dígitos.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, code, newPassword });
      // Tras el reset, el backend invalida las sesiones: hay que volver a entrar.
      navigate("/login", {
        replace: true,
        state: {
          notice: "Contraseña actualizada. Inicia sesión con tu nueva clave.",
        },
      });
    } catch (err) {
      const message = normalizeApiError(
        err,
        "No se pudo actualizar la contraseña. Intenta de nuevo.",
      );
      setError(message);
      // Si se agotaron los intentos, forzamos volver al Paso 1.
      if (/intentos/i.test(message)) {
        setStep(1);
        setCode("");
        setSecondsLeft(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código → vuelve a ejecutar el Paso 1.
  const handleResend = async () => {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setInfo("Te enviamos un nuevo código si el correo está registrado.");
      setCode("");
      setSecondsLeft(CODE_TTL_SECONDS);
    } catch (err) {
      setError(
        normalizeApiError(err, "No se pudo reenviar el código. Intenta luego."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-1/2 p-5 xl:p-25 lg:px-10 md:px-25 h-fit">
      <div className="mb-8">
        <div className="flex gap-5 items-center">
          <span className="text-[#2B7A57] font-bold text-3xl">
            <Link to={"/"}>TKUIDO</Link>
          </span>
        </div>
        <h2 className="resp-h2 mb-2">Recuperar contraseña</h2>
        <p className="text-sm text-gray-500 mb-6">
          {step === 1
            ? "Ingresa tu correo y te enviaremos un código de recuperación."
            : "Ingresa el código que recibiste y tu nueva contraseña."}
        </p>

        {step === 1 ? (
          <form className="space-y-5" onSubmit={handleForgot}>
            <div>
              <label
                htmlFor="forgot-email"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="relative">
                <img
                  src={mail}
                  alt=""
                  aria-hidden="true"
                  className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                />
                <input
                  id="forgot-email"
                  type="email"
                  className="resp-p pl-10 pr-4 py-2 w-full bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="ejemplo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="resp-btn w-full bg-[#2B7A57] text-white py-2 rounded-lg hover:bg-green-700 transition duration-300 disabled:opacity-70"
            >
              {loading ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleReset}>
            <div>
              <label
                htmlFor="reset-code"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Código de 6 dígitos
              </label>
              <div className="relative">
                <img
                  src={ticket}
                  alt=""
                  aria-hidden="true"
                  className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                />
                <input
                  id="reset-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="resp-p pl-10 pr-4 py-2 w-full bg-white rounded-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="123456"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {secondsLeft > 0
                    ? `El código expira en ${formatTimer(secondsLeft)}`
                    : "El código pudo haber expirado."}
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-[#35AE74] font-medium hover:underline disabled:opacity-60"
                >
                  Reenviar código
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="reset-new-password"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Nueva contraseña
              </label>
              <div className="relative">
                <img
                  src={lock}
                  alt=""
                  aria-hidden="true"
                  className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                />
                <input
                  id="reset-new-password"
                  type="password"
                  placeholder="••••••••"
                  className="resp-p pl-10 pr-4 py-2 w-full bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reset-confirm-password"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <img
                  src={lock}
                  alt=""
                  aria-hidden="true"
                  className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                />
                <input
                  id="reset-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  className="resp-p pl-10 pr-4 py-2 w-full bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="resp-btn w-full bg-[#2B7A57] text-white py-2 rounded-lg hover:bg-green-700 transition duration-300 disabled:opacity-70"
            >
              {loading ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </form>
        )}

        {info && <p className="text-sm text-emerald-700 mt-3">{info}</p>}
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        <div className="mt-4 text-sm">
          <Link
            to={"/login"}
            className="text-[#35AE74] font-medium hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FormForgotPassword;
