// src/hook/useTasaBcv.ts
// Carga la tasa BCV desde el backend y expone el cálculo del monto en Bs.
// La usan el resumen del carrito, pago móvil y tarjeta nacional.
import { useCallback, useEffect, useState } from "react";
import { getTasaBcv, usdToBs, type TasaBcvResponse } from "../api/exchangeRate";
import { getApiErrorMessage } from "../utils/apiError";

type UseTasaBcv = {
  tasa: TasaBcvResponse | null;
  loading: boolean;
  error: string;
  /** Convierte un monto en dólares a bolívares. null mientras no haya tasa. */
  aBolivares: (montoUsd: number) => number | null;
  recargar: () => void;
};

export const useTasaBcv = (): UseTasaBcv => {
  const [tasa, setTasa] = useState<TasaBcvResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    setLoading(true);
    setError("");

    getTasaBcv()
      .then((data) => {
        if (!activo) return;
        setTasa(data);
      })
      .catch((err) => {
        if (!activo) return;
        setTasa(null);
        setError(
          getApiErrorMessage(
            err,
            "No se pudo obtener la tasa de cambio. Intenta de nuevo en unos minutos.",
          ),
        );
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, [intento]);

  const aBolivares = useCallback(
    (montoUsd: number): number | null =>
      tasa ? usdToBs(montoUsd, tasa.tasa) : null,
    [tasa],
  );

  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  return { tasa, loading, error, aBolivares, recargar };
};
