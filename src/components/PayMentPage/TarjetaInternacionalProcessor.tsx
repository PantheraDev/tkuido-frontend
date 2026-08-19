import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  createTdcInternacional,
  getPerfilByUserId,
  resolveClienteDataFromPerfil,
} from "../../api/payment";
import { intlRules, validate } from "../../validation/payments";
import { getUserIdFromToken } from "../../utils/auth";
import { useSelectedPlan, type SelectedPlan } from "../../hook/useSelectedPlan";

type TarjetaInternacionalProcessorProps = {
  formId: string;
  onFormValidityChange: (isValid: boolean) => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
};

// Idempotencia (Fase 6.3): un externalId estable por intento de compra.
// Se reutiliza mientras dure la sesión del mismo plan para que reintentar
// el mismo carrito no genere órdenes duplicadas en el backend.
const getStableExternalId = (plan: SelectedPlan | null): string => {
  const key = `intl_externalId_${plan?.id ?? "x"}`;
  let value = sessionStorage.getItem(key);
  if (!value) {
    value = `TKD-${plan?.id ?? 0}-${Date.now()}`;
    sessionStorage.setItem(key, value);
  }
  return value;
};

const TarjetaInternacionalProcessor = ({
  formId,
  onFormValidityChange,
  onSubmittingChange,
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
  const [submitted, setSubmitted] = useState(false);

  const selectedPlan = useSelectedPlan();
  const externalId = useMemo(
    () => getStableExternalId(selectedPlan),
    [selectedPlan],
  );

  useEffect(() => {
    if (selectedPlan && !monto) {
      setMonto(String(Number((selectedPlan.price * 1.16).toFixed(2))));
    }
  }, [selectedPlan, monto]);

  const values = useMemo(
    () => ({
      Monto: monto.trim(),
      Descripcion: descripcion,
      Dni: dni.trim().toUpperCase(),
      Name: name,
      token: token.trim(),
    }),
    [monto, descripcion, dni, name, token],
  );

  const errors = useMemo(() => validate(intlRules, values), [values]);
  const isFormValid = Object.keys(errors).length === 0;

  useEffect(() => {
    onFormValidityChange(isFormValid);
  }, [isFormValid, onFormValidityChange]);

  useEffect(() => {
    onSubmittingChange(loading);
  }, [loading, onSubmittingChange]);

  const fieldError = (field: string) =>
    submitted && errors[field] ? (
      <p className="text-xs text-red-600 mt-1">{errors[field]}</p>
    ) : null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitted(true);

    if (!isFormValid) {
      setError("Revisa los campos marcados antes de continuar.");
      return;
    }

    const userId = getUserIdFromToken();
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
        Monto: values.Monto,
        Descripcion: values.Descripcion,
        Dni: values.Dni,
        Name: values.Name,
        token: values.token,
        expireMinute: 10,
        externalId,
      });

      const hostedUrl = apiResponse?.url ?? apiResponse?.CallbackUrl;
      const ordenID = apiResponse?.ordenID ?? apiResponse?.idPago;

      if (!hostedUrl) {
        setError("La pasarela no devolvió URL de pago. Intenta de nuevo.");
        return;
      }

      // Guarda el ordenID para reconciliar al volver de la página alojada.
      // Nunca confíes solo en el redirect: /checkout/* reconfirma con GET /:orderId.
      sessionStorage.setItem("intl_ordenID", String(ordenID ?? ""));
      sessionStorage.setItem("intl_externalId", externalId);

      // Redirige el navegador al formulario alojado de Bancamiga (3DS).
      window.location.assign(hostedUrl);
    } catch {
      setError("No se pudo procesar el pago internacional.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-purple-50 text-purple-800 text-sm p-3 rounded-lg mb-4">
        Procesado por tarjeta internacional (/international-pay/tdc). Ingresarás
        los datos de la tarjeta en la página segura de Bancamiga.
      </div>

      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <fieldset disabled={loading} className="space-y-4 border-0 p-0 m-0">
        <div>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Monto"
            className="w-full border p-3 rounded-lg"
            value={monto}
            onChange={(event) => setMonto(event.target.value)}
          />
          {fieldError("Monto")}
        </div>

        <div>
          <input
            type="text"
            placeholder="Descripcion"
            className="w-full border p-3 rounded-lg"
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
          />
          {fieldError("Descripcion")}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="DNI (ej. V12345678)"
              className="w-full border p-3 rounded-lg uppercase"
              value={dni}
              onChange={(event) => setDni(event.target.value.toUpperCase())}
            />
            {fieldError("Dni")}
          </div>
          <div>
            <input
              type="text"
              placeholder="Nombre"
              className="w-full border p-3 rounded-lg"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {fieldError("Name")}
          </div>
        </div>

        <div>
          <input
            type="text"
            placeholder="Token"
            className="w-full border p-3 rounded-lg"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
          {fieldError("token")}
        </div>
        </fieldset>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}

        {loading && (
          <p className="text-sm text-gray-600">Redirigiendo a la pasarela...</p>
        )}
      </form>
    </div>
  );
};

export default TarjetaInternacionalProcessor;
