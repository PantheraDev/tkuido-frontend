import { type FormEvent, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  getPerfilByUserId,
  processTdcNacionalAndCreatePoliza,
  resolveClienteDataFromPerfil,
} from "../../api/payment";

type SelectedPlan = {
  id?: number;
  name: string;
  price: number;
};

type TarjetaNacionalProcessorProps = {
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

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const getOneYearAfter = (dateString: string): string => {
  const base = new Date(dateString);
  const end = new Date(base);
  end.setFullYear(base.getFullYear() + 1);
  return formatDate(end);
};

const TarjetaNacionalProcessor = ({
  formId,
  onFormValidityChange,
}: TarjetaNacionalProcessorProps) => {
  const [creditCardNumber, setCreditCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expirationMonth, setExpirationMonth] = useState("");
  const [expirationYear, setExpirationYear] = useState("");
  const [ci, setCi] = useState("");
  const [reference, setReference] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedPlan = useMemo(() => getSelectedPlan(), []);
  const amount = useMemo(
    () =>
      String(selectedPlan ? Number((selectedPlan.price * 1.16).toFixed(2)) : 0),
    [selectedPlan],
  );

  const isFormValid = useMemo(() => {
    const card = creditCardNumber.replace(/\D/g, "");
    const cvvClean = cvv.replace(/\D/g, "");
    const ciClean = ci.replace(/\D/g, "");
    const month = expirationMonth.replace(/\D/g, "");
    const year = expirationYear.replace(/\D/g, "");

    return (
      card.length >= 13 &&
      cvvClean.length >= 3 &&
      ciClean.length >= 6 &&
      month.length === 2 &&
      Number(month) >= 1 &&
      Number(month) <= 12 &&
      year.length === 2 &&
      reference.trim() !== ""
    );
  }, [creditCardNumber, cvv, ci, expirationMonth, expirationYear, reference]);

  useEffect(() => {
    onFormValidityChange(isFormValid);
  }, [isFormValid, onFormValidityChange]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!isFormValid) {
      setError("Completa todos los campos requeridos para procesar el pago.");
      return;
    }

    const userId = getUserIdFromToken() || localStorage.getItem("userId");
    if (!userId) {
      setError(
        "No se encontro el usuario en la sesion. Inicia sesion de nuevo.",
      );
      return;
    }

    const fechaInicio = formatDate(new Date());
    const fechaFin = getOneYearAfter(fechaInicio);
    const prima = String(selectedPlan?.price ?? 0);
    const productoPlan = String(selectedPlan?.id ?? 1);

    try {
      setLoading(true);

      const perfil = await getPerfilByUserId(userId);
      const { idCliente, clienteUuid } = resolveClienteDataFromPerfil(perfil);

      if (!idCliente) {
        setError("No se pudo obtener idCliente desde el perfil del usuario.");
        return;
      }

      const result = await processTdcNacionalAndCreatePoliza({
        tdcNacional: {
          idCliente,
          amount,
          creditCardNumber: creditCardNumber.replace(/\D/g, ""),
          cvv: cvv.replace(/\D/g, ""),
          expirationMonth: expirationMonth.replace(/\D/g, ""),
          expirationYear: expirationYear.replace(/\D/g, ""),
          ci: ci.replace(/\D/g, ""),
          reference,
        },
        polizaBase: {
          fechaInicio,
          fechaFin,
          prima,
          sumaAsegurada: "50000",
          deducible: "500",
          estado: "Activo",
          producto_plan: productoPlan,
          cliente: clienteUuid ?? userId,
        },
      });
      console.log("Respuesta /tdc-nacional:", result.tdc);
      console.log("Respuesta /poliza:", result.poliza);

      setSuccessMessage(
        "Pago con tarjeta nacional aprobado y poliza creada correctamente.",
      );
    } catch {
      setError("No se pudo procesar el pago con tarjeta nacional.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg mb-4">
        Procesado por tarjeta nacional (/tdc-nacional). Se crea la poliza al
        aprobarse.
      </div>

      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Numero de Tarjeta"
          className="w-full border p-3 rounded-lg"
          value={creditCardNumber}
          onChange={(event) => setCreditCardNumber(event.target.value)}
        />

        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="MM"
            className="w-full border p-3 rounded-lg"
            value={expirationMonth}
            onChange={(event) => setExpirationMonth(event.target.value)}
          />
          <input
            type="text"
            placeholder="YY"
            className="w-full border p-3 rounded-lg"
            value={expirationYear}
            onChange={(event) => setExpirationYear(event.target.value)}
          />
          <input
            type="text"
            placeholder="CVV"
            className="w-full border p-3 rounded-lg"
            value={cvv}
            onChange={(event) => setCvv(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="CI"
            className="w-full border p-3 rounded-lg"
            value={ci}
            onChange={(event) => setCi(event.target.value)}
          />
          <input
            type="text"
            placeholder="Referencia"
            className="w-full border p-3 rounded-lg"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          />
        </div>

        <div className="text-xs text-gray-500">Monto a procesar: ${amount}</div>

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
    </div>
  );
};

export default TarjetaNacionalProcessor;
