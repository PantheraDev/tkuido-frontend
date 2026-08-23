import { useLocation } from "react-router-dom";
import { formatBs } from "../../api/exchangeRate";
import { useTasaBcv } from "../../hook/useTasaBcv";

type SelectedPlan = {
  id?: number;
  name: string;
  price: number;
};

const TotalPay = () => {
  const location = useLocation();
  const selectedPlanFromState =
    (location.state as { selectedPlan?: SelectedPlan } | null)?.selectedPlan ??
    null;

  const selectedPlanFromStorage = (() => {
    const stored = localStorage.getItem("selectedPlan");
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored) as SelectedPlan;
      if (parsed?.name && typeof parsed.price === "number") {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  })();

  const selectedPlan = selectedPlanFromState ?? selectedPlanFromStorage;
  const subtotal = selectedPlan?.price ?? 0;
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  // Los métodos en bolívares (pago móvil y tarjeta nacional) cobran este total
  // convertido a la tasa oficial del BCV.
  const { tasa, loading: tasaLoading, aBolivares } = useTasaBcv();
  const totalBs = total > 0 ? aBolivares(Number(total.toFixed(2))) : null;

  return (
    <>
      <h4 className="font-bold text-lg mb-4 text-gray-800">
        Resumen del Pedido
      </h4>
      <div className="flex justify-between mb-2 text-sm">
        <span className="text-gray-600">
          Plan {selectedPlan?.name ?? "No seleccionado"}
        </span>
        <span className="font-medium">${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between mb-4 text-sm">
        <span className="text-gray-600">IVA</span>
        <span className="font-medium">${tax.toFixed(2)}</span>
      </div>
      <div className="border-t pt-4 flex justify-between items-center">
        <span className="font-bold text-lg">Total</span>
        <span className="font-bold text-xl text-emerald-600">
          ${total.toFixed(2)}
        </span>
      </div>

      <div className="mt-2 text-right text-sm">
        {tasaLoading && (
          <span className="text-gray-400">Consultando tasa BCV...</span>
        )}
        {!tasaLoading && totalBs !== null && (
          <>
            <span className="text-gray-600">Bs {formatBs(totalBs)}</span>
            <p className="text-xs text-gray-400">
              Tasa BCV {tasa?.tasa}
              {tasa?.desactualizada && " (ultima disponible)"}
            </p>
          </>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-400 text-center">
        Pago seguro encriptado SSL 256-bit
      </div>
    </>
  );
};

export default TotalPay;
