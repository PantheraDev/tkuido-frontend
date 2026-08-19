import { useEffect, useState } from "react";
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

type CheckoutResultProps = {
  // Estado "optimista" según la ruta a la que el callback redirigió.
  outcome: OrderStatus;
};

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

// Polling opcional para `pending` (Fase 6.2): el cliente pudo volver antes de
// que Bancamiga confirmara. El backend además reconcilia por cron de respaldo.
const pollStatus = async (
  orderId: string,
  current: OrderStatus,
  { tries = 5, intervalMs = 4000 } = {},
): Promise<OrderStatus> => {
  let status = current;
  for (let i = 0; i < tries; i++) {
    if (status !== "pending") return status;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    try {
      const res = await getInternacionalPaymentStatus(orderId);
      status = normalizeStatus(res) ?? status;
    } catch {
      return status;
    }
  }
  return status;
};

const VIEW: Record<
  OrderStatus,
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
      "Estamos confirmando tu pago. Te avisaremos en cuanto se resuelva; puedes volver a consultar en unos minutos.",
    tone: "text-gray-600",
  },
};

const CheckoutResult = ({ outcome }: CheckoutResultProps) => {
  const [params] = useSearchParams();
  const reference =
    params.get("ref") ?? params.get("externalId") ?? params.get("orderId");

  const [status, setStatus] = useState<OrderStatus>(outcome);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    let active = true;

    // Reconfirmación recomendada: no confíes solo en la ruta del callback.
    const ordenID = sessionStorage.getItem("intl_ordenID");

    const finish = (final: OrderStatus) => {
      if (!active) return;
      setStatus(final);
      setVerifying(false);
      sessionStorage.removeItem("intl_ordenID");
    };

    if (!ordenID) {
      finish(outcome);
      return;
    }

    getInternacionalPaymentStatus(ordenID)
      .then(async (res) => {
        const resolved = normalizeStatus(res) ?? outcome;
        const final =
          resolved === "pending"
            ? await pollStatus(ordenID, resolved)
            : resolved;
        finish(final);
      })
      .catch(() => finish(outcome));

    return () => {
      active = false;
    };
  }, [outcome]);

  const view = VIEW[status];
  const canRetry = status === "rejected" || status === "expired" || status === "cancelled";

  return (
    <>
      <Header />
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white border rounded-2xl shadow-sm p-8 text-center">
          {verifying ? (
            <>
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-100 border-t-[#2B7A57]" />
              <p className="mt-4 text-sm font-medium text-gray-700">
                Verificando el estado de tu pago...
              </p>
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

              <div className="mt-8 flex flex-col gap-3">
                {status === "approved" && (
                  <Link
                    to="/perfil"
                    className="w-full h-11 rounded-xl bg-[#2B7A57] text-white font-semibold flex items-center justify-center hover:bg-[#245f44] transition"
                  >
                    Ver mi póliza
                  </Link>
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
