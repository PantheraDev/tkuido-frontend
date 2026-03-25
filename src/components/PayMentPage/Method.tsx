import PagoMovilProcessor from "./PagoMovilProcessor";

type PaymentMethod = "nacional" | "internacional" | "pagomovil";

type MethodProps = {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  paymentFormId: string;
  onPagoMovilValidityChange: (isValid: boolean) => void;
};

const Method = ({
  paymentMethod,
  onPaymentMethodChange,
  paymentFormId,
  onPagoMovilValidityChange,
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
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg mb-4">
              Aceptamos Débito y Crédito Nacional (Mercantil, Banesco, etc).
            </div>
            <input
              type="text"
              placeholder="Número de Tarjeta (16 dígitos)"
              className="w-full border p-3 rounded-lg"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="MM/AA"
                className="w-full border p-3 rounded-lg"
              />
              <input
                type="text"
                placeholder="CVC"
                className="w-full border p-3 rounded-lg"
              />
            </div>
            <input
              type="text"
              placeholder="Cédula del Titular"
              className="w-full border p-3 rounded-lg"
            />
            <input
              type="text"
              placeholder="Nombre del Titular"
              className="w-full border p-3 rounded-lg"
            />
            <input
              type="text"
              placeholder="Apellido del Titular"
              className="w-full border p-3 rounded-lg"
            />
          </div>
        )}

        {paymentMethod === "internacional" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-purple-50 text-purple-800 text-sm p-3 rounded-lg mb-4">
              Procesado vía Stripe/PayPal en USD.
            </div>
            <input
              type="text"
              placeholder="Card Number"
              className="w-full border p-3 rounded-lg"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full border p-3 rounded-lg"
              />
              <input
                type="text"
                placeholder="CVC"
                className="w-full border p-3 rounded-lg"
              />
            </div>
            <input
              type="text"
              placeholder="Cardholder Name"
              className="w-full border p-3 rounded-lg"
            />
            <input
              type="text"
              placeholder="DNI / Passport"
              className="w-full border p-3 rounded-lg"
            />
            <input
              type="text"
              placeholder="Description"
              className="w-full border p-3 rounded-lg"
            />
          </div>
        )}

        {paymentMethod === "pagomovil" && (
          <PagoMovilProcessor
            formId={paymentFormId}
            onFormValidityChange={onPagoMovilValidityChange}
          />
        )}
      </div>
    </>
  );
};

export default Method;
