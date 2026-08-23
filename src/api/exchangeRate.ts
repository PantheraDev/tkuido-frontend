// src/api/exchangeRate.ts
// Tasa de cambio oficial (BCV) servida por el backend, que a su vez la toma de
// ve.dolarapi.com y la cachea. Es la única fuente para calcular los montos en
// bolívares de pago móvil y tarjeta nacional.
import axiosClient from "./axiosClient";

export type TasaBcvResponse = {
  tasa: number;
  moneda: string;
  fuente: string;
  fechaActualizacion: string;
  /** true = el backend no pudo refrescar la tasa y sirve la última conocida. */
  desactualizada: boolean;
  antiguedadHoras: number;
};

export const getTasaBcv = async (): Promise<TasaBcvResponse> => {
  const { data } = await axiosClient.get<TasaBcvResponse>("/tasa-bcv");
  return data;
};

/**
 * Convierte dólares a bolívares replicando exactamente el redondeo del backend
 * (ExchangeRate.round2). Si los dos lados redondearan distinto, la validación
 * de monto del servidor rechazaría pagos legítimos por un céntimo.
 */
export const usdToBs = (montoUsd: number, tasa: number): number =>
  Math.round((montoUsd * tasa + Number.EPSILON) * 100) / 100;

/** Formatea un monto en bolívares con separadores locales (1.234,56). */
export const formatBs = (montoBs: number): string =>
  montoBs.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
