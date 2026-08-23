import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getInternacionalPaymentStatus,
  type InternacionalPaymentStatusResponse,
} from "../api/payment";
import Header from "../components/commons/Header";
import Footer from "../components/MainPage/Footer";

// Estado de la orden tal como lo entrega/reconcilia el backend contra Bancamiga.
type OrderStatus =
  | "approved"
  | "rejected"
  | "pending"
  | "expired"
  | "cancelled";

// `unverified` no es un estado de la orden: es "no pudimos preguntarle al
// backend". Antes se caía silenciosamente al outcome optimista de la ruta, así
// que un backend caído mostraba "Pago confirmado" sin haber confirmado nada.
type ViewState = OrderStatus | "unverified";

type CheckoutResultProps = {
  // Estado "optimista" según la ruta a la que el callback redirigió.
  outcome: OrderStatus;
};

const MAX_TRIES = 5;
const RETRY_INTERVAL_MS = 4000;

const normalizeStatus = (
  res: InternacionalPaymentStatusResponse,
): OrderStatus | null => {
  const raw = res?.Status ?? res?.status;
  if (typeof raw !== "string") return null;
  const value = raw.toLowerCase();
  if (value.includes("approv") || value.includes("aprob")) return "approved";
  if (value.includes("reject") || value.includes("rechaz")) return "rejected";
  if (value.includes("cancel")) return "cancelled";
  if (value.includes("expir") || value.includes("vencid")) return "expired";
  if (value.includes("pend")) return "pending";
  return null;
};

const readStored = (key: string): string | null => {
  // `TarjetaInternacionalProcessor` llegó a guardar "" cuando la pasarela no
  // devolvía ordenID; sin este trim quedaba una referencia vacía que saltaba
  // la verificación entera.
  const value = sessionStorage.getItem(key)?.trim();
  return value ? value : null;
};

const isFinal = (status: OrderStatus): boolean => status !== "pending";

const VIEW: Record<
  ViewState,
  { icon: string; title: string; message: string; tone: string }
> = {
  approved: {
    icon: "✅",
    title: "Pago confirmado",
    message: "Tu pago fue aprobado correctamente. Ya puedes ver tu póliza.",
    tone: "text-emerald-700",
  },
  rejected: {
    icon: "❌",
    title: "Pago rechazado",
    message:
      "El pago no fue aprobado. Puedes reintentar generando una nueva orden.",
    tone: "text-red-600",
  },
  cancelled: {
    icon: "⌛",
    title: "Pago cancelado",
    message: "La operación fue cancelada o expiró. Intenta de nuevo cuando quieras.",
    tone: "text-amber-600",
  },
  expired: {
    icon: "⌛",
    title: "Orden vencida",
    message: "La orden expiró. Crea una orden nueva para volver a intentarlo.",
    tone: "text-amber-600",
  },
  pending: {
    icon: "⏳",
    title: "Pago en verificación",
    message:
      "Estamos confirmando tu pago con el banco. Te avisaremos por correo en cuanto se resuelva; también puedes volver a consultar en unos minutos.",
    tone: "text-gray-600",
  },
  unverified: {
    icon: "⚠️",
    title: "No pudimos confirmar tu pago",
    message:
      "El pago pudo haberse procesado, pero no logramos verificarlo con el servidor. No vuelvas a pagar todavía: revisa tu perfil en unos minutos o contacta a soporte con la referencia.",
    tone: "text-amber-600",
  },
};

const CheckoutResult = ({ outcome }: CheckoutResultProps) => {
  const [params] = useSearchParams();
  const paramRef =
    params.get("ref") ?? params.get("externalId") ?? params.get("orderId");

  const [status, setStatus] = useState<ViewState>(outcome);
  const [verifying, setVerifying] = useState(true);
  const [attempt, setAttempt] = useState(1);
  // Cuántas veces se consultó de verdad: distingue "confirmado por el backend"
  // de "es lo que decía la URL del callback".
  const [confirmed, setConfirmed] = useState(false);
  const activeRef = useRef(true);

  const verify = useCallback(async () => {
    const reference =
      readStored("intl_ordenID") ?? readStored("intl_externalId") ?? paramRef;

    // El backend resuelve la orden tanto por ordenID de Bancamiga como por
    // nuestro externalId, así que cualquiera de las dos referencias sirve.
    if (!reference) {
      if (!activeRef.current) return;
      setStatus("unverified");
      setVerifying(false);
      return;
    }

    setVerifying(true);
    setStatus(outcome);
    setConfirmed(false);

    let lastError = true;

    for (let i = 0; i < MAX_TRIES; i++) {
      if (!activeRef.current) return;
      setAttempt(i + 1);

      try {
        const res = await getInternacionalPaymentStatus(reference);
        if (!activeRef.current) return;

        lastError = false;
        const resolved = normalizeStatus(res);

        if (resolved && isFinal(resolved)) {
          setStatus(resolved);
          setConfirmed(true);
          setVerifying(false);
          sessionStorage.removeItem("intl_ordenID");
          sessionStorage.removeItem("intl_externalId");
          return;
        }
      } catch {
        lastError = true;
      }

      // Sigue pendiente (o falló la consulta): reintenta, salvo en la última
      // vuelta, donde esperar otro intervalo no aporta nada.
      if (i < MAX_TRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
      }
    }

    if (!activeRef.current) return;
    // Agotados los intentos: si nunca respondió, no afirmamos ningún estado.
    setStatus(lastError ? "unverified" : "pending");
    setConfirmed(!lastError);
    setVerifying(false);
  }, [outcome, paramRef]);

  useEffect(() => {
    activeRef.current = true;
    void verify();
    return () => {
      activeRef.current = false;
    };
  }, [verify]);

  const view = VIEW[status];
  const canRetry =
    status === "rejected" || status === "expired" || status === "cancelled";
  const canRecheck = status === "pending" || status === "unverified";
  const reference =
    paramRef ?? readStored("intl_ordenID") ?? readStored("intl_externalId");

  return (
    <>
      <Header />
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white border rounded-2xl shadow-sm p-8 text-center">
          {verifying ? (
            <>
              <div
                role="status"
                aria-live="polite"
                className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-100 border-t-[#2B7A57]"
              />
              <p className="mt-4 text-sm font-medium text-gray-700">
                Verificando el estado de tu pago...
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Consultando al banco (intento {attempt} de {MAX_TRIES}). No
                cierres esta ventana.
              </p>
              {reference && (
                <p className="mt-3 text-xs text-gray-400">
                  Referencia: {reference}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="text-5xl">{view.icon}</div>
              <h1 className={`mt-4 text-2xl font-bold ${view.tone}`}>
                {view.title}
              </h1>
              <p className="mt-2 text-sm text-gray-600">{view.message}</p>
              {reference && (
                <p className="mt-3 text-xs text-gray-400">
                  Referencia: {reference}
                </p>
              )}
              {!confirmed && status !== "unverified" && (
                <p className="mt-2 text-xs text-amber-600">
                  Estado sin confirmar con el servidor.
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3">
                {status === "approved" && (
                  <Link
                    to="/perfil"
                    className="w-full h-11 rounded-xl bg-[#2B7A57] text-white font-semibold flex items-center justify-center hover:bg-[#245f44] transition"
                  >
                    Ver mi póliza
                  </Link>
                )}
                {canRecheck && (
                  <button
                    type="button"
                    onClick={() => void verify()}
                    className="w-full h-11 rounded-xl bg-[#2B7A57] text-white font-semibold flex items-center justify-center hover:bg-[#245f44] transition"
                  >
                    Volver a verificar
                  </button>
                )}
                {canRetry && (
                  <Link
                    to="/payment"
                    className="w-full h-11 rounded-xl bg-[#2B7A57] text-white font-semibold flex items-center justify-center hover:bg-[#245f44] transition"
                  >
                    Reintentar pago
                  </Link>
                )}
                <Link
                  to="/"
                  className="w-full h-11 rounded-xl border border-gray-300 text-gray-700 font-semibold flex items-center justify-center hover:bg-gray-50 transition"
                >
                  Volver al inicio
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutResult;
