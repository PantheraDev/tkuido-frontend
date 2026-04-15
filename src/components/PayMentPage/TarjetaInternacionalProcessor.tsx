import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  createTdcInternacional,
  getPerfilByUserId,
  resolveClienteDataFromPerfil,
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

  const watchTabUntilClose = (tab: Window | null) => {
    if (!tab) {
      setError(
        "El navegador bloqueo la nueva pestana. Habilita popups e intenta de nuevo.",
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
      }
    }, 700);
  };

  const handleOpenFlowTab = (url: string | undefined) => {
    if (!url) {
      setError("La respuesta no contiene URL para abrir.");
      return;
    }

    const newTab = window.open(url, "_blank");
    watchTabUntilClose(newTab);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800">
              Acciones de Pago Internacional
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              idPago: {response.idPago}. Abre una opcion para continuar el
              flujo.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => handleOpenFlowTab(response.CallbackUrl)}
                className="h-11 rounded-lg bg-[#2B7A57] text-white font-semibold"
              >
                Abrir CallbackUrl
              </button>

              <button
                type="button"
                onClick={() => handleOpenFlowTab(response.CallbackUrlCancel)}
                className="h-11 rounded-lg border border-gray-300 text-gray-700 font-semibold"
              >
                Abrir Cancelacion
              </button>

              <button
                type="button"
                onClick={() => setShowActionsModal(false)}
                className="h-10 rounded-lg text-sm text-gray-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {externalTabLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 p-4">
          <div className="rounded-xl bg-white p-6 shadow-xl text-center min-w-[280px]">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#2B7A57]" />
            <p className="mt-3 text-sm text-gray-700">
              Esperando que cierres la pestana del flujo de pago...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarjetaInternacionalProcessor;
