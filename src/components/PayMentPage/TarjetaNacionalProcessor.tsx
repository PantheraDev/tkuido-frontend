import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  getPerfilByUserId,
  PagoCobradoSinPolizaError,
  processTdcNacionalAndCreatePoliza,
  resolveClienteDataFromPerfil,
} from "../../api/payment";
import { formatBs } from "../../api/exchangeRate";
import { nationalRules, validate } from "../../validation/payments";
import { getUserIdFromToken } from "../../utils/auth";
import {
  esErrorDeCobroIncierto,
  getApiErrorMessage,
} from "../../utils/apiError";
import { formatDate, getOneYearAfter } from "../../utils/date";
import { useSelectedPlan } from "../../hook/useSelectedPlan";
import { useTasaBcv } from "../../hook/useTasaBcv";

type TarjetaNacionalProcessorProps = {
  formId: string;
  onFormValidityChange: (isValid: boolean) => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
};

const TarjetaNacionalProcessor = ({
  formId,
  onFormValidityChange,
  onSubmittingChange,
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
  const [submitted, setSubmitted] = useState(false);

  const selectedPlan = useSelectedPlan();
  const { tasa, loading: tasaLoading, error: tasaError, aBolivares } = useTasaBcv();

  // El plan está en dólares; este gateway cobra en bolívares.
  const montoUsd = useMemo(
    () =>
      selectedPlan ? Number((selectedPlan.price * 1.16).toFixed(2)) : 0,
    [selectedPlan],
  );
  const montoBs = useMemo(
    () => (montoUsd > 0 ? aBolivares(montoUsd) : null),
    [montoUsd, aBolivares],
  );

  // Valores normalizados (solo dígitos) para validar contra el espejo del DTO.
  const values = useMemo(
    () => ({
      amount: montoBs !== null ? String(montoBs) : "",
      creditCardNumber: creditCardNumber.replace(/\D/g, ""),
      cvv: cvv.replace(/\D/g, ""),
      expirationMonth: expirationMonth.replace(/\D/g, ""),
      expirationYear: expirationYear.replace(/\D/g, ""),
      ci: ci.replace(/\D/g, ""),
      reference: reference.replace(/\D/g, ""),
    }),
    [montoBs, creditCardNumber, cvv, expirationMonth, expirationYear, ci, reference],
  );

  const errors = useMemo(() => validate(nationalRules, values), [values]);
  // Sin tasa no se puede calcular el monto real, así que no se habilita el pago.
  const isFormValid = Object.keys(errors).length === 0 && montoBs !== null;

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
    setSuccessMessage("");
    setSubmitted(true);

    if (montoBs === null) {
      setError(
        "No se pudo obtener la tasa de cambio para calcular el monto en bolívares.",
      );
      return;
    }

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

    const fechaInicio = formatDate(new Date());
    const fechaFin = getOneYearAfter(fechaInicio);
    const prima = String(selectedPlan?.price ?? 0);
    const productoPlan = String(selectedPlan?.id ?? 1);

    try {
      setLoading(true);

      const perfil = await getPerfilByUserId(userId);
      const { idCliente } = resolveClienteDataFromPerfil(perfil);

      if (!idCliente) {
        setError("No se pudo obtener idCliente desde el perfil del usuario.");
        return;
      }

      await processTdcNacionalAndCreatePoliza({
        tdcNacional: {
          idCliente,
          amount: values.amount,
          montoUsd: montoUsd.toFixed(2),
          creditCardNumber: values.creditCardNumber,
          cvv: values.cvv,
          expirationMonth: values.expirationMonth,
          expirationYear: values.expirationYear,
          ci: values.ci,
          reference: values.reference,
        },
        polizaBase: {
          fechaInicio,
          fechaFin,
          prima,
          sumaAsegurada: "50000",
          deducible: "500",
          estado: "Activo",
          producto_plan: productoPlan,
          // POST /poliza resuelve el cliente con findClientById(idCliente) y lo
          // contrasta con el dueño del pago: aquí va el id de cliente, nunca el
          // uuid del usuario.
          cliente: idCliente,
        },
      });

      // Higiene PCI: no retener datos sensibles de tarjeta en memoria.
      setCreditCardNumber("");
      setCvv("");
      setSubmitted(false);

      setSuccessMessage(
        "Pago con tarjeta nacional aprobado y poliza creada correctamente.",
      );
    } catch (err) {
      // El backend distingue rechazo del emisor, doble cargo (409), exceso de
      // intentos (429) y pasarela caída (503): ese mensaje es el que importa.
      if (err instanceof PagoCobradoSinPolizaError) {
        setCreditCardNumber("");
        setCvv("");
      }

      const mensaje = getApiErrorMessage(
        err,
        "No se pudo procesar el pago con tarjeta nacional.",
      );

      // 409/429/502/503 dejan el cobro en estado incierto: reintentar a ciegas
      // es justo lo que puede acabar en un doble cargo.
      setError(
        esErrorDeCobroIncierto(err)
          ? `${mensaje} Verifica el estado de tu tarjeta antes de volver a intentarlo.`
          : mensaje,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg mb-4">
        Procesado por tarjeta nacional (/tdc-nacional). Se cobra en bolívares a
        la tasa oficial del BCV y se crea la poliza al aprobarse.
      </div>

      <form
        id={formId}
        onSubmit={handleSubmit}
        className="space-y-4"
        autoComplete="off"
      >
        <fieldset disabled={loading} className="space-y-4 border-0 p-0 m-0">
        <div>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Numero de Tarjeta"
            className="w-full border p-3 rounded-lg"
            value={creditCardNumber}
            onChange={(event) => setCreditCardNumber(event.target.value)}
          />
          {fieldError("creditCardNumber")}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="MM"
              className="w-full border p-3 rounded-lg"
              value={expirationMonth}
              onChange={(event) => setExpirationMonth(event.target.value)}
            />
            {fieldError("expirationMonth")}
          </div>
          <div>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="YY"
              className="w-full border p-3 rounded-lg"
              value={expirationYear}
              onChange={(event) => setExpirationYear(event.target.value)}
            />
            {fieldError("expirationYear")}
          </div>
          <div>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="CVV"
              className="w-full border p-3 rounded-lg"
              value={cvv}
              onChange={(event) => setCvv(event.target.value)}
            />
            {fieldError("cvv")}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="CI"
              className="w-full border p-3 rounded-lg"
              value={ci}
              onChange={(event) => setCi(event.target.value)}
            />
            {fieldError("ci")}
          </div>
          <div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Referencia"
              className="w-full border p-3 rounded-lg"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
            />
            {fieldError("reference")}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          {tasaLoading && "Consultando la tasa del BCV..."}
          {!tasaLoading && montoBs !== null && (
            <>
              Monto a procesar:{" "}
              <span className="font-semibold text-gray-700">
                Bs {formatBs(montoBs)}
              </span>{" "}
              (${montoUsd.toFixed(2)} a tasa {tasa?.tasa})
            </>
          )}
        </div>
        </fieldset>

        {tasaError && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            {tasaError}
          </p>
        )}

        {tasa?.desactualizada && (
          <p className="text-xs text-amber-700">
            La tasa mostrada es la ultima disponible; podria no estar
            actualizada.
          </p>
        )}

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
