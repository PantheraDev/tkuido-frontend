// src/validation/payments.ts
// Validación en el cliente, espejo de los DTO del backend (Fase 3 del plan).
// Es solo UX: el backend re-valida igual, así que no es una barrera de seguridad.

export type ValidationRule = (value: string) => true | string;
export type ValidationRules = Record<string, ValidationRule>;
export type ValidationErrors = Record<string, string>;

// Nacional — espejo de `nationalPay` DTO (cargo directo en bolívares).
export const nationalRules: ValidationRules = {
  amount: (v) =>
    /^\d+(\.\d{1,2})?$/.test(v) || "Monto numérico, hasta 2 decimales",
  creditCardNumber: (v) =>
    /^\d{15,16}$/.test(v) || "Tarjeta de 15 o 16 dígitos",
  cvv: (v) => /^\d{3,4}$/.test(v) || "CVV de 3 o 4 dígitos",
  expirationMonth: (v) =>
    /^(0[1-9]|1[0-2])$/.test(v) || "Mes entre 01 y 12",
  expirationYear: (v) => /^\d{2}$/.test(v) || "Año de 2 dígitos (ej. 25)",
  ci: (v) => /^\d{6,12}$/.test(v) || "Cédula de 6 a 12 dígitos",
  reference: (v) => /^\d{1,10}$/.test(v) || "Referencia numérica (máx. 10 dígitos)",
};

// Pago móvil — espejo de `VerifyPagoDto`.
// `phone` viaja como 58 + operadora + 7 dígitos (ej. 584241234567) y la fecha
// debe cumplir el @Matches(/^\d{4}-\d{2}-\d{2}$/) del DTO.
export const pagoMovilRules: ValidationRules = {
  bank: (v) => /^\d{4}$/.test(v) || "Selecciona el banco emisor",
  phonePrefix: (v) => /^58\d{3}$/.test(v) || "Selecciona la operadora",
  phoneNumber: (v) =>
    /^\d{7}$/.test(v) || "El teléfono son 7 dígitos (sin el prefijo)",
  reference: (v) =>
    /^\d{4,}$/.test(v) || "Referencia numérica (mínimo 4 dígitos)",
  date: (v) =>
    /^\d{4}-\d{2}-\d{2}$/.test(v) || "Fecha en formato YYYY-MM-DD",
};

/** La transferencia no puede ser futura. Se valida aparte por depender de hoy. */
export const fechaNoFutura = (date: string, hoy: string): true | string =>
  date <= hoy || "La fecha del pago no puede ser futura";

// Internacional — espejo de `InternacionalPayDto` (orden + página alojada en dólares).
export const intlRules: ValidationRules = {
  Monto: (v) =>
    /^\d+(\.\d{1,2})?$/.test(v) || "Monto con hasta 2 decimales",
  Descripcion: (v) => v.length <= 255 || "Descripción ≤ 255 caracteres",
  Dni: (v) =>
    /^[VEJP]\d{6,12}$/.test(v) || "Inicia con V/E/J/P + 6 a 12 dígitos",
  Name: (v) =>
    (v.trim().length > 0 && v.length <= 100) ||
    "Nombre requerido (≤ 100 caracteres)",
  token: (v) => v.trim().length > 0 || "Token de la pasarela requerido",
};

export function validate(
  rules: ValidationRules,
  values: Record<string, string>,
): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const result = rule(values[field] ?? "");
    if (result !== true) errors[field] = result;
  }
  return errors; // {} = válido
}
