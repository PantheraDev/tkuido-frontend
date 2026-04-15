import PagoMovilProcessor from "./PagoMovilProcessor";
import TarjetaNacionalProcessor from "./TarjetaNacionalProcessor";
import TarjetaInternacionalProcessor from "./TarjetaInternacionalProcessor";

type PaymentMethod = "nacional" | "internacional" | "pagomovil";

type MethodProps = {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  pagoMovilFormId: string;
  nacionalFormId: string;
  internacionalFormId: string;
  onPagoMovilValidityChange: (isValid: boolean) => void;
  onNacionalValidityChange: (isValid: boolean) => void;
  onInternacionalValidityChange: (isValid: boolean) => void;
};

const Method = ({
  paymentMethod,
  onPaymentMethodChange,
  pagoMovilFormId,
  nacionalFormId,
  internacionalFormId,
  onPagoMovilValidityChange,
  onNacionalValidityChange,
  onInternacionalValidityChange,
}: MethodProps) => {
  return (
    <>
      {/* Selector de Método - SIN ÍCONOS */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "nacional", label: "Tarjeta Nacional" },
          { id: "internacional", label: "Tarjeta Internacional" },
          { id: "pagomovil", label: "Pago Móvil" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => onPaymentMethodChange(m.id as PaymentMethod)}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
              paymentMethod === m.id
                ? "bg-white shadow text-emerald-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Formulario Dinámico según Selección */}
      <div className="bg-white p-6 border rounded-xl">
        {paymentMethod === "nacional" && (
          <TarjetaNacionalProcessor
            formId={nacionalFormId}
            onFormValidityChange={onNacionalValidityChange}
          />
        )}

        {paymentMethod === "internacional" && (
          <TarjetaInternacionalProcessor
            formId={internacionalFormId}
            onFormValidityChange={onInternacionalValidityChange}
          />
        )}

        {paymentMethod === "pagomovil" && (
          <PagoMovilProcessor
            formId={pagoMovilFormId}
            onFormValidityChange={onPagoMovilValidityChange}
          />
        )}
      </div>
    </>
  );
};

export default Method;
