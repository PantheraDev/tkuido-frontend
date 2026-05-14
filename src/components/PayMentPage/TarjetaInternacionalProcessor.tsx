import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  createTdcInternacional,
  getInternacionalPaymentStatus,
  getPerfilByUserId,
  resolveClienteDataFromPerfil,
  type InternacionalPaymentStatusResponse,
  type TdcInternacionalResponse,
} from "../../api/payment";

type SelectedPlan = {
  id?: number;
  name: string;
  price: number;
};

type TarjetaInternacionalProcessorProps = {
  formId: string;
  onFormValidityChange: (isValid: boolean) => void;
};

type JwtPayload = {
  id?: string | number;
  sub?: string | number;
  idUser?: string | number;
};

const getSelectedPlan = (): SelectedPlan | null => {
  const raw = localStorage.getItem("selectedPlan");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SelectedPlan;
    if (parsed?.name && typeof parsed.price === "number") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const candidate = decoded?.sub ?? decoded?.id ?? decoded?.idUser;
    if (candidate === undefined || candidate === null) return null;
    return String(candidate);
  } catch {
    return null;
  }
};

const TarjetaInternacionalProcessor = ({
  formId,
  onFormValidityChange,
}: TarjetaInternacionalProcessorProps) => {
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState(
    "Pago de poliza internacional",
  );
  const [dni, setDni] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [response, setResponse] = useState<TdcInternacionalResponse | null>(
    null,
  );
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [externalTabLoading, setExternalTabLoading] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [paymentValidation, setPaymentValidation] =
    useState<InternacionalPaymentStatusResponse | null>(null);

  const tabWatcherRef = useRef<number | null>(null);

  const selectedPlan = useMemo(() => getSelectedPlan(), []);

  useEffect(() => {
    if (selectedPlan && !monto) {
      setMonto(String(Number((selectedPlan.price * 1.16).toFixed(2))));
    }
  }, [selectedPlan, monto]);

  useEffect(() => {
    return () => {
      if (tabWatcherRef.current !== null) {
        window.clearInterval(tabWatcherRef.current);
      }
    };
  }, []);

  const isFormValid = useMemo(() => {
    const parsedAmount = Number(monto);
    return (
      monto.trim() !== "" &&
      Number.isFinite(parsedAmount) &&
      parsedAmount > 0 &&
      descripcion.trim() !== "" &&
      dni.trim() !== "" &&
      name.trim() !== "" &&
      token.trim() !== ""
    );
  }, [monto, descripcion, dni, name, token]);

  useEffect(() => {
    onFormValidityChange(isFormValid);
  }, [isFormValid, onFormValidityChange]);

  const watchTabUntilClose = (tab: Window | null, onClose?: () => void) => {
    if (!tab) {
      setError(
        "El navegador bloqueó la nueva pestaña. Habilita popups e intenta de nuevo.",
      );
      return;
    }

    setExternalTabLoading(true);

    if (tabWatcherRef.current !== null) {
      window.clearInterval(tabWatcherRef.current);
    }

    tabWatcherRef.current = window.setInterval(() => {
      if (tab.closed) {
        if (tabWatcherRef.current !== null) {
          window.clearInterval(tabWatcherRef.current);
          tabWatcherRef.current = null;
        }
        setExternalTabLoading(false);
        onClose?.();
      }
    }, 700);
  };

  const handleContinue = () => {
    const url = response?.CallbackUrl ?? response?.url;
    if (!url) {
      setError("La respuesta no contiene URL para continuar el pago.");
      return;
    }

    const orderId = response?.ordenID ?? response?.idPago;
    if (!orderId) {
      setError("No se encontró el ID de orden para validar el pago.");
      return;
    }

    setShowActionsModal(false);

    const newTab = window.open(url, "_blank");

    watchTabUntilClose(newTab, async () => {
      try {
        setValidationLoading(true);
        setValidationError("");
        const status = await getInternacionalPaymentStatus(String(orderId));
        console.log("Estado pago internacional:", status);
        setPaymentValidation(status);
      } catch {
        setValidationError(
          "No se pudo verificar el estado del pago. Revisa tu historial de pagos.",
        );
      } finally {
        setValidationLoading(false);
      }
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setShowActionsModal(false);
    setResponse(null);

    if (!isFormValid) {
      setError(
        "Completa todos los campos requeridos para procesar el pago internacional.",
      );
      return;
    }

    const userId = getUserIdFromToken() || localStorage.getItem("userId");
    if (!userId) {
      setError(
        "No se encontro el usuario en la sesion. Inicia sesion de nuevo.",
      );
      return;
    }

    try {
      setLoading(true);

      const perfil = await getPerfilByUserId(userId);
      const { idCliente } = resolveClienteDataFromPerfil(perfil);

      if (!idCliente) {
        setError("No se pudo obtener idCliente desde el perfil del usuario.");
        return;
      }

      const apiResponse = await createTdcInternacional({
        idCliente,
        Monto: monto,
        Descripcion: descripcion,
        Dni: dni,
        Name: name,
        token,
      });

      console.log("Respuesta /international-pay/tdc:", apiResponse);

      setResponse(apiResponse);
      setShowActionsModal(true);
      setSuccessMessage(
        "Pago internacional iniciado. Elige una accion para abrir el flujo.",
      );
    } catch {
      setError("No se pudo procesar el pago internacional.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-purple-50 text-purple-800 text-sm p-3 rounded-lg mb-4">
        Procesado por tarjeta internacional (/international-pay/tdc).
      </div>

      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Monto"
          className="w-full border p-3 rounded-lg"
          value={monto}
          onChange={(event) => setMonto(event.target.value)}
        />

        <input
          type="text"
          placeholder="Descripcion"
          className="w-full border p-3 rounded-lg"
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Dni"
            className="w-full border p-3 rounded-lg"
            value={dni}
            onChange={(event) => setDni(event.target.value)}
          />
          <input
            type="text"
            placeholder="Name"
            className="w-full border p-3 rounded-lg"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <input
          type="text"
          placeholder="Token"
          className="w-full border p-3 rounded-lg"
          value={token}
          onChange={(event) => setToken(event.target.value)}
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}

        {successMessage && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            {successMessage}
          </p>
        )}

        {loading && <p className="text-sm text-gray-600">Procesando pago...</p>}
      </form>

      {showActionsModal && response && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800">
              Confirmar Pago Internacional
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Tu solicitud fue iniciada correctamente. ¿Deseas proceder con el
              pago ahora?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleContinue}
                className="flex-1 h-11 rounded-xl bg-[#2B7A57] text-white font-semibold hover:bg-[#245f44] transition"
              >
                Continuar
              </button>

              <button
                type="button"
                onClick={() => setShowActionsModal(false)}
                className="flex-1 h-11 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {externalTabLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="rounded-2xl bg-white p-8 shadow-2xl text-center min-w-[300px]">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-100 border-t-[#2B7A57]" />
            <p className="mt-4 text-sm font-medium text-gray-700">
              Esperando que completes el pago...
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Cierra la pestaña cuando finalices para continuar.
            </p>
          </div>
        </div>
      )}

      {validationLoading && (
        <p className="text-sm text-gray-500 mt-2">
          Verificando estado del pago internacional...
        </p>
      )}

      {validationError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
          {validationError}
        </p>
      )}

      {paymentValidation && !validationLoading && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-2">
          <p className="text-sm font-semibold text-emerald-700">
            Pago verificado
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            Estado:{" "}
            {typeof paymentValidation.Status === "string"
              ? paymentValidation.Status
              : typeof paymentValidation.status === "string"
                ? paymentValidation.status
                : "Revisado correctamente"}
          </p>
        </div>
      )}
    </div>
  );
};

export default TarjetaInternacionalProcessor;
