const selectedPlan = { name: "Plan Premium", price: 16.0 };
const TotalPay = () => {
  return (
    <>
      <h4 className="font-bold text-lg mb-4 text-gray-800">
        Resumen del Pedido
      </h4>
      <div className="flex justify-between mb-2 text-sm">
        <span className="text-gray-600">Plan {selectedPlan?.name}</span>
        <span className="font-medium">${selectedPlan?.price.toFixed(2)}</span>
      </div>
      <div className="flex justify-between mb-4 text-sm">
        <span className="text-gray-600">IVA</span>
        <span className="font-medium">
          {selectedPlan ? (selectedPlan.price * 0.16).toFixed(2) : "0.00"}
        </span>
      </div>
      <div className="border-t pt-4 flex justify-between items-center">
        <span className="font-bold text-lg">Total</span>
        <span className="font-bold text-xl text-emerald-600">
          ${selectedPlan ? (selectedPlan.price * 1.16).toFixed(2) : "0.00"}
        </span>
      </div>
      <div className="mt-6 text-xs text-gray-400 text-center">
        Pago seguro encriptado SSL 256-bit
      </div>
    </>
  );
};

export default TotalPay;
