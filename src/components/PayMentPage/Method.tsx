import { useState } from "react";

const Method = () => {
  const [paymentMethod, setPaymentMethod] = useState("nacional"); // nacional, internacional, pagomovil
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
            onClick={() => setPaymentMethod(m.id)}
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
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gray-50 p-4 rounded-lg text-center mb-4 border border-gray-200">
              <p className="text-sm text-gray-500">
                Realiza el pago a los siguientes datos:
              </p>
              <p className="font-bold text-lg text-gray-800 mt-2">
                0105 - Mercantil
              </p>
              <p className="text-gray-800">0414-123-4567</p>
              <p className="text-gray-800">J-123456789</p>
            </div>
            <label className="block text-sm font-bold text-gray-700">
              Reportar Pago
            </label>
            <div className="grid grid-cols-2 gap-4">
              <select className="w-full border p-3 rounded-lg bg-white">
                <option>Banco Mercantil</option>
                <option>Banesco</option>
                <option>Banco de Venezuela</option>
              </select>
              <input
                type="text"
                placeholder="Teléfono de origen"
                className="w-full border p-3 rounded-lg"
              />
            </div>
            <input
              type="text"
              placeholder="Número de Referencia (Últimos 4 o 6 dígitos)"
              className="w-full border p-3 rounded-lg"
            />
            <input type="date" className="w-full border p-3 rounded-lg" />
          </div>
        )}
      </div>
    </>
  );
};

export default Method;
