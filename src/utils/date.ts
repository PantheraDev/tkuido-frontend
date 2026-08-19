// src/utils/date.ts
// Utilidades de fecha compartidas por los procesadores de pago (pólizas con
// vigencia de un año desde la fecha de inicio).

export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const getOneYearAfter = (dateString: string): string => {
  const base = new Date(dateString);
  const end = new Date(base);
  end.setFullYear(base.getFullYear() + 1);
  return formatDate(end);
};
