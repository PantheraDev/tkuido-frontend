// src/utils/date.ts
// Utilidades de fecha compartidas por los procesadores de pago (pólizas con
// vigencia de un año desde la fecha de inicio).

/**
 * Formatea a YYYY-MM-DD usando la fecha LOCAL del usuario.
 *
 * Antes se usaba toISOString(), que convierte a UTC: en Venezuela (UTC-4),
 * a partir de las 20:00 la "fecha de hoy" saltaba al día siguiente y el banco
 * no encontraba la transferencia reportada.
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Parsea YYYY-MM-DD como fecha local (no UTC, por el mismo motivo). */
export const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

export const getOneYearAfter = (dateString: string): string => {
  const base = parseDate(dateString);
  const end = new Date(base);
  end.setFullYear(base.getFullYear() + 1);
  return formatDate(end);
};

/** Fecha local de hoy en YYYY-MM-DD, para topes de inputs type="date". */
export const todayLocal = (): string => formatDate(new Date());
