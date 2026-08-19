import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  getPerfilByUserId,
  processPagoMovilAndCreatePoliza,
  resolveClienteDataFromPerfil,
} from "../../api/payment";
import { getUserIdFromToken } from "../../utils/auth";
import { formatDate, getOneYearAfter } from "../../utils/date";
import { useSelectedPlan } from "../../hook/useSelectedPlan";

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
  const [phonePrefix, setPhonePrefix] = useState("0414");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(formatDate(new Date()));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedPlan = useSelectedPlan();

  const buildPhoneForApi = (): string => {
    const prefix = phonePrefix.replace(/^0/, "");
    const number = phoneNumber.replace(/\D/g, "");
    return `${prefix}${number}`;
  };

  const isFormValid = useMemo(() => {
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");

    return (
      bank.trim() !== "" &&
      phonePrefix.trim() !== "" &&
      reference.trim() !== "" &&
      date.trim() !== "" &&
      cleanPhoneNumber.length >= 7
    );
  }, [bank, phonePrefix, reference, date, phoneNumber]);

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

    if (!phoneNumber || !reference || !date || !bank || !phonePrefix) {
      setError("Completa todos los campos para reportar el pago.");
      return;
    }

    const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");
    if (cleanPhoneNumber.length < 7) {
      setError("Ingresa un numero telefonico valido (al menos 7 digitos).");
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
    } catch {
      setError(
        "No se pudo procesar el pago o crear la poliza. Verifica los datos e intenta de nuevo.",
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
      </div>

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
            type="number"
            placeholder="Numero de Referencia (Ultimos 4 o 6 digitos)"
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
            type="number"
            placeholder="Número de Teléfono (sin el prefijo)"
            className="w-full border p-3 rounded-lg"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
        </div>

        <input
          type="date"
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
