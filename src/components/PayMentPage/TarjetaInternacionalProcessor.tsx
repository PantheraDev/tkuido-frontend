import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  createTdcInternacional,
  getPerfilByUserId,
  resolveClienteDataFromPerfil,
} from "../../api/payment";
import { intlRules, validate } from "../../validation/payments";
import { getUserIdFromToken } from "../../utils/auth";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDate, getOneYearAfter } from "../../utils/date";
import { useSelectedPlan, type SelectedPlan } from "../../hook/useSelectedPlan";

type TarjetaInternacionalProcessorProps = {
  formId: string;
  onFormValidityChange: (isValid: boolean) => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
};

// Idempotencia (Fase 6.3): un externalId estable por intento de compra.
// Se reutiliza mientras dure la sesión del mismo plan para que reintentar
// el mismo carrito no genere órdenes duplicadas en el backend.
const externalIdKey = (plan: SelectedPlan | null) =>
  `intl_externalId_${plan?.id ?? "x"}`;

const getStableExternalId = (plan: SelectedPlan | null): string => {
  const key = externalIdKey(plan);
  let value = sessionStorage.getItem(key);
  if (!value) {
    value = `TKD-${plan?.id ?? 0}-${Date.now()}`;
    sessionStorage.setItem(key, value);
  }
  return value;
};

/**
 * Cierra el intento actual liberando el externalId.
 *
 * El backend reutiliza cualquier orden con ese externalId cuyo estado no sea
 * EXPIRED, así que conservarlo tras cerrar el intento impedía volver a comprar
 * el mismo plan: devolvía la orden vieja (ya pagada o rechazada) en lugar de
 * crear una nueva.
 */
const clearExternalId = (plan: SelectedPlan | null): void => {
  sessionStorage.removeItem(externalIdKey(plan));
};

const TarjetaInternacionalProcessor = ({
  formId,
  onFormValidityChange,
  onSubmittingChange,
}: TarjetaInternacionalProcessorProps) => {
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

  // El monto se deriva del plan y no es editable: antes era un input libre y
  // el usuario podía cambiar 18.56 por 1.00 (el backend acepta cualquier
  // monto > 0 al crear la orden).
  const monto = useMemo(
    () =>
      selectedPlan
        ? String(Number((selectedPlan.price * 1.16).toFixed(2)))
        : "",
    [selectedPlan],
  );

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

      const fechaInicio = formatDate(new Date());

      const apiResponse = await createTdcInternacional({
        idCliente,
        Monto: values.Monto,
        Descripcion: values.Descripcion,
        Dni: values.Dni,
        Name: values.Name,
        token: values.token,
        expireMinute: 10,
        externalId,
        // Mismos valores que usa el flujo nacional, para que la póliza salga
        // igual sin importar el método de pago.
        poliza: {
          producto_plan: String(selectedPlan?.id ?? 1),
          fechaInicio,
          fechaFin: getOneYearAfter(fechaInicio),
          prima: String(selectedPlan?.price ?? 0),
          sumaAsegurada: "50000",
          deducible: "500",
          estado: "Activo",
        },
      });

      // La orden viaja dentro de `data` (TdcPayResponse), no en la raíz.
      const hostedUrl = apiResponse?.data?.url;
      const ordenID = apiResponse?.data?.ordenID;

      if (!hostedUrl) {
        setError(
          apiResponse?.message ??
            "La pasarela no devolvió URL de pago. Intenta de nuevo.",
        );
        setLoading(false);
        return;
      }

      // Guarda el ordenID para reconciliar al volver de la página alojada.
      // Nunca confíes solo en el redirect: /checkout/* reconfirma con GET /:orderId.
      // Si la pasarela no devuelve ordenID no se guarda nada: escribir "" dejaba
      // una referencia vacía y /checkout/* se saltaba la verificación. El
      // externalId siempre queda como respaldo, y el backend resuelve por ambos.
      if (ordenID) {
        sessionStorage.setItem("intl_ordenID", String(ordenID));
      } else {
        sessionStorage.removeItem("intl_ordenID");
      }
      sessionStorage.setItem("intl_externalId", externalId);

      // El intento queda cerrado: al volver de la pasarela, comprar otra vez
      // debe generar una orden nueva y no reutilizar ésta.
      clearExternalId(selectedPlan);

      // Redirige el navegador al formulario alojado de Bancamiga (3DS).
      window.location.assign(hostedUrl);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "No se pudo procesar el pago internacional."),
      );
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
          <label className="block text-xs text-gray-500 mb-1">
            Monto a pagar
          </label>
          <div className="w-full border p-3 rounded-lg bg-gray-50 font-semibold text-gray-800">
            ${monto || "0.00"}
          </div>
          {selectedPlan && (
            <p className="text-xs text-gray-400 mt-1">
              Plan {selectedPlan.name} (${selectedPlan.price.toFixed(2)}) + IVA
            </p>
          )}
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
