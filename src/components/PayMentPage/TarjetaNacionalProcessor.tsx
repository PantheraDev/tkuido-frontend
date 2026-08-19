import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  getPerfilByUserId,
  processTdcNacionalAndCreatePoliza,
  resolveClienteDataFromPerfil,
} from "../../api/payment";
import { nationalRules, validate } from "../../validation/payments";
import { getUserIdFromToken } from "../../utils/auth";
import { formatDate, getOneYearAfter } from "../../utils/date";
import { useSelectedPlan } from "../../hook/useSelectedPlan";

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
  const amount = useMemo(
    () =>
      String(selectedPlan ? Number((selectedPlan.price * 1.16).toFixed(2)) : 0),
    [selectedPlan],
  );

  // Valores normalizados (solo dígitos) para validar contra el espejo del DTO.
  const values = useMemo(
    () => ({
      amount,
      creditCardNumber: creditCardNumber.replace(/\D/g, ""),
      cvv: cvv.replace(/\D/g, ""),
      expirationMonth: expirationMonth.replace(/\D/g, ""),
      expirationYear: expirationYear.replace(/\D/g, ""),
      ci: ci.replace(/\D/g, ""),
      reference: reference.replace(/\D/g, ""),
    }),
    [amount, creditCardNumber, cvv, expirationMonth, expirationYear, ci, reference],
  );

  const errors = useMemo(() => validate(nationalRules, values), [values]);
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
    setSuccessMessage("");
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

      await processTdcNacionalAndCreatePoliza({
        tdcNacional: {
          idCliente,
          amount: values.amount,
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
          cliente: clienteUuid ?? userId,
        },
      });

      // Higiene PCI (Fase 7): no retener datos sensibles de tarjeta en memoria.
      setCreditCardNumber("");
      setCvv("");
      setSubmitted(false);

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

        <div className="text-xs text-gray-500">Monto a procesar: ${amount}</div>
        </fieldset>

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
