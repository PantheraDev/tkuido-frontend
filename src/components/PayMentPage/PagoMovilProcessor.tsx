import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  getPerfilByUserId,
  processPagoMovilAndCreatePoliza,
  resolveClienteDataFromPerfil,
} from "../../api/payment";
import { formatBs } from "../../api/exchangeRate";
import {
  fechaNoFutura,
  pagoMovilRules,
  validate,
} from "../../validation/payments";
import { getUserIdFromToken } from "../../utils/auth";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDate, getOneYearAfter, todayLocal } from "../../utils/date";
import { useSelectedPlan } from "../../hook/useSelectedPlan";
import { useTasaBcv } from "../../hook/useTasaBcv";

type PagoMovilProcessorProps = {
  formId: string;
  onFormValidityChange: (isValid: boolean) => void;
  onSubmittingChange: (isSubmitting: boolean) => void;
};

const PagoMovilProcessor = ({
  formId,
  onFormValidityChange,
  onSubmittingChange,
}: PagoMovilProcessorProps) => {
  const [bank, setBank] = useState("0105");
  // El valor debe coincidir con los `value` del select (prefijo internacional
  // sin el 0 inicial), no con la etiqueta que ve el usuario.
  const [phonePrefix, setPhonePrefix] = useState("58414");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(formatDate(new Date()));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedPlan = useSelectedPlan();
  const { tasa, loading: tasaLoading, error: tasaError, aBolivares } = useTasaBcv();

  const montoUsd = useMemo(
    () => (selectedPlan ? Number((selectedPlan.price * 1.16).toFixed(2)) : 0),
    [selectedPlan],
  );
  const montoBs = useMemo(
    () => (montoUsd > 0 ? aBolivares(montoUsd) : null),
    [montoUsd, aBolivares],
  );

  const hoy = todayLocal();

  // El DTO espera 58 + operadora + número (584241234567). Antes se hacía
  // `phonePrefix.replace(/^0/, "")`, que con el valor por defecto producía
  // "414..." en vez de "58414...".
  const buildPhoneForApi = (): string =>
    `${phonePrefix}${phoneNumber.replace(/\D/g, "")}`;

  const values = useMemo(
    () => ({
      bank,
      phonePrefix,
      phoneNumber: phoneNumber.replace(/\D/g, ""),
      reference: reference.replace(/\D/g, ""),
      date,
    }),
    [bank, phonePrefix, phoneNumber, reference, date],
  );

  const errors = useMemo(() => validate(pagoMovilRules, values), [values]);
  const isFormValid =
    Object.keys(errors).length === 0 && fechaNoFutura(date, hoy) === true;

  useEffect(() => {
    onFormValidityChange(isFormValid);
  }, [isFormValid, onFormValidityChange]);

  useEffect(() => {
    onSubmittingChange(loading);
  }, [loading, onSubmittingChange]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const primerError =
      Object.values(errors)[0] ??
      (fechaNoFutura(date, hoy) === true ? null : fechaNoFutura(date, hoy));

    if (typeof primerError === "string") {
      setError(primerError);
      return;
    }

    const phone = buildPhoneForApi();

    const userId = getUserIdFromToken();
    if (!userId) {
      setError(
        "No se encontro el usuario en la sesion. Inicia sesion de nuevo.",
      );
      return;
    }

    const prima = String(selectedPlan?.price ?? 0);
    const fechaInicio = date;
    const fechaFin = getOneYearAfter(date);
    const productoPlan = String(selectedPlan?.id ?? 1);

    try {
      setLoading(true);

      const perfil = await getPerfilByUserId(userId);
      const { idCliente } = resolveClienteDataFromPerfil(perfil);

      if (idCliente === null) {
        setError("No se pudo obtener idCliente desde el perfil del usuario.");
        return;
      }

      const result = await processPagoMovilAndCreatePoliza({
        pagoMovil: {
          idCliente: String(idCliente),
          phone,
          bank,
          date,
          reference: values.reference,
          // El backend contrasta el monto transferido con este precio a la
          // tasa BCV: sin esto bastaba reportar 1 Bs para emitir la poliza.
          ...(montoUsd > 0 ? { montoUsd: montoUsd.toFixed(2) } : {}),
        },
        polizaBase: {
          fechaInicio,
          fechaFin,
          prima,
          sumaAsegurada: "50000",
          deducible: "500",
          estado: "Activo",
          producto_plan: productoPlan,
          cliente: idCliente,
        },
      });

      if (!result) {
        setError(
          "No se pudo procesar el pago o crear la poliza. Verifica los datos e intenta de nuevo.",
        );
        return;
      }

      setSuccessMessage(`Pago registrado y poliza creada correctamente.`);
    } catch (err) {
      // getApiErrorMessage devuelve el mensaje del backend (monto que no
      // cuadra, referencia inexistente...) y, para PagoCobradoSinPolizaError,
      // el aviso de que el pago SÍ se registró.
      setError(
        getApiErrorMessage(
          err,
          "No se pudo verificar el pago. Revisa la referencia, el banco y la fecha.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-gray-50 p-4 rounded-lg text-center mb-4 border border-gray-200">
        <p className="text-sm text-gray-500">
          Realiza el pago a los siguientes datos:
        </p>
        <p className="font-bold text-lg text-gray-800 mt-2">0172 - Bancamiga</p>
        <p className="text-gray-800">0412-6086009</p>
        <p className="text-gray-800">J-314689088</p>

        <div className="mt-3 pt-3 border-t border-gray-200">
          {tasaLoading && (
            <p className="text-sm text-gray-500">
              Calculando el monto en bolivares...
            </p>
          )}
          {!tasaLoading && montoBs !== null && (
            <>
              <p className="text-sm text-gray-500">Monto exacto a transferir</p>
              <p className="font-bold text-xl text-emerald-700">
                Bs {formatBs(montoBs)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ${montoUsd.toFixed(2)} a la tasa BCV de {tasa?.tasa}
              </p>
            </>
          )}
        </div>
      </div>

      {tasaError && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          {tasaError}
        </p>
      )}

      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <fieldset disabled={loading} className="space-y-4 border-0 p-0 m-0">
        <label className="block text-sm font-bold text-gray-700">
          Reportar Pago
        </label>
        <div className="grid grid-cols-2 gap-4">
          <select
            className="w-full border p-3 rounded-lg bg-white"
            value={bank}
            onChange={(event) => setBank(event.target.value)}
          >
            <option value="0105">(0105)- Banco Mercantil</option>
            <option value="0134">(0134)- Banesco</option>
            <option value="0102">(0102)- Banco de Venezuela</option>
            <option value="0104">(0104)- Banco Venezolano de Crédito</option>
            <option value="0108">(0108)- BBVA Provincial</option>
            <option value="0114">(0114)- Bancaribe</option>
            <option value="0115">(0115)- Banco Exterior</option>
            <option value="0116">
              (0116)- Banco Occidental de Descuento (BOD)
            </option>
            <option value="0128">(0128)- Banco Caroní</option>
            <option value="0137">(0137)- Banco Sofitasa</option>
            <option value="0138">(0138)- Banco Plaza</option>
            <option value="0146">(0146)- Bangente</option>
            <option value="0151">(0151)- BFC Banco Fondo Común</option>
            <option value="0156">(0156)- 100% Banco</option>
            <option value="0157">(0157)- Del Sur</option>
            <option value="0163">(0163)- Banco del Tesoro</option>
            <option value="0166">(0166)- Banco Agrícola de Venezuela</option>
            <option value="0168">(0168)- Bancrecer</option>
            <option value="0169">(0169)- Mi Banco</option>
            <option value="0171">(0171)- Banco Activo</option>
            <option value="0172">(0172)- Bancamiga</option>
            <option value="0173">
              (0173)- Banco Internacional de Desarrollo
            </option>
            <option value="0174">(0174)- Banplus</option>
            <option value="0175">
              (0175)- Banco Bicentenario / Banco Digital de los Trabajadores
            </option>
            <option value="0177">(0177)- BANFANB (Fuerza Armada)</option>
            <option value="0191">(0191)- BNC Nacional de Crédito</option>
          </select>

          <input
            type="text"
            inputMode="numeric"
            placeholder="Numero de Referencia"
            className="w-full border p-3 rounded-lg"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <select
            className="w-full border p-3 rounded-lg bg-white"
            value={phonePrefix}
            onChange={(event) => setPhonePrefix(event.target.value)}
          >
            <option value="58414">0414</option>
            <option value="58424">0424</option>
            <option value="58416">0416</option>
            <option value="58426">0426</option>
            <option value="58412">0412</option>
            <option value="58422">0422</option>
          </select>

          <input
            type="text"
            inputMode="numeric"
            maxLength={7}
            placeholder="Número de Teléfono (7 dígitos)"
            className="w-full border p-3 rounded-lg"
            value={phoneNumber}
            onChange={(event) =>
              setPhoneNumber(event.target.value.replace(/\D/g, "").slice(0, 7))
            }
          />
        </div>

        <input
          type="date"
          max={hoy}
          className="w-full border p-3 rounded-lg"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        </fieldset>

        {selectedPlan && (
          <p className="text-xs text-gray-500">
            Plan seleccionado: {selectedPlan.name} ($
            {selectedPlan.price.toFixed(2)})
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

export default PagoMovilProcessor;
