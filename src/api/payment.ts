import axiosClient from "./axiosClient";

export type PagoMovilPayload = {
  idCliente: string;
  phone: string;
  bank: string;
  date: string;
  reference: string;
  /** Precio del plan en dólares: el backend contrasta la transferencia con la tasa BCV. */
  montoUsd?: string;
};

export type PagoMovilResponse = {
  // idPago es el uuid de PaymentOrm, no un número.
  idPago: string;
  ID: string;
  Amount: number;
  BancoOrig: string;
  NroReferencia: string;
  FechaMovimiento: string;
  Status: string;
};

export type TdcNacionalPayload = {
  idCliente: string;
  /** Monto en bolívares, ya convertido con la tasa BCV. */
  amount: string;
  creditCardNumber: string;
  cvv: string;
  expirationMonth: string;
  expirationYear: string;
  ci: string;
  reference: string;
  /** Precio del plan en dólares, para que el backend revalide `amount`. */
  montoUsd?: string;
};

export type TdcNacionalResponse = {
  idPago: string;
  idPoliza: string | null;
  idTdcNacional: string;
  ok: boolean;
  numero: string | null;
  codigo: string | null;
  monto: string;
  aprobado: boolean;
  respuesta_codigo: string | null;
  respuesta_numero: string | null;
  respuesta_data: string | null;
  referencia: string;
  mensaje_sistema: string | null;
};

/**
 * Póliza a emitir cuando Bancamiga apruebe la orden.
 *
 * A diferencia de nacional y pago móvil, aquí el frontend no puede llamar a
 * POST /poliza tras el cobro: el cliente se va a la página del banco y puede
 * no volver. Estos datos viajan con la orden y el backend emite la póliza solo.
 */
export type PolizaSolicitadaPayload = {
  producto_plan: string;
  fechaInicio: string;
  fechaFin: string;
  prima: string;
  sumaAsegurada: string;
  deducible: string;
  estado: string;
};

export type TdcInternacionalPayload = {
  idCliente: string;
  Monto: string;
  Descripcion: string;
  Dni: string;
  Name: string;
  token: string;
  poliza?: PolizaSolicitadaPayload;
  // Opcionales (Fase 6.3): expiración de la orden e idempotencia desde el front.
  expireMinute?: number;
  externalId?: string;
};

/**
 * Respuesta real de POST /international-pay/tdc (TdcPayResponse del backend).
 * OJO: `ordenID` y `url` viajan DENTRO de `data`, no en la raíz.
 */
export type TdcInternacionalResponse = {
  idPago: string;
  idPoliza: string | null;
  idTdcInternacional: string;
  success: boolean;
  message: string;
  data: {
    ordenID: string | null;
    url: string | null;
    status?: string;
    raw?: unknown;
  } | null;
};

export type PolizaPayload = {
  idPago: string;
  fechaInicio: string;
  fechaFin: string;
  prima: string;
  sumaAsegurada: string;
  deducible: string;
  estado: string;
  producto_plan: string;
  cliente: string;
};

type PerfilClienteResponse = {
  id?: string | number;
  idCliente?: string | number;
  id_cliente?: string | number;
  clienteId?: string | number;
  idUser?: {
    idUsuario?: string;
  };
  ID?: string;
  cliente?: string;
};

const toStringValue = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
};


export const getPerfilByUserId = async (
  userId: string,
): Promise<PerfilClienteResponse> => {
  const { data } = await axiosClient.get<PerfilClienteResponse>(
    `cliente/perfil/${userId}`,
  );
  return data;
};

export const resolveClienteDataFromPerfil = (perfil: PerfilClienteResponse): {
  idCliente: string | null;
  clienteUuid: string | null;
} => {
  const idCliente =
    toStringValue(perfil.id) ??
    toStringValue(perfil.idCliente) ??
    toStringValue(perfil.id_cliente) ??
    toStringValue(perfil.clienteId);

  const clienteUuid =
    toStringValue(perfil.idUser?.idUsuario) ??
    toStringValue(perfil.ID) ??
    toStringValue(perfil.cliente);

  return { idCliente, clienteUuid };
};

export const createPagoMovil = async (
  payload: PagoMovilPayload,
): Promise<PagoMovilResponse> => {
  const { data } = await axiosClient.post<PagoMovilResponse>("/PM", payload);
  return data;
};

export const createPoliza = async (
  payload: PolizaPayload,
): Promise<unknown> => {
  const { data } = await axiosClient.post("/poliza", payload);
  return data;
};

export const createTdcNacional = async (
  payload: TdcNacionalPayload,
): Promise<TdcNacionalResponse> => {
  const { data } = await axiosClient.post<TdcNacionalResponse>(
    "/tdc-nacional",
    payload,
  );
  return data;
};

export const createTdcInternacional = async (
  payload: TdcInternacionalPayload,
): Promise<TdcInternacionalResponse> => {
  const { data } = await axiosClient.post<TdcInternacionalResponse>(
    "/international-pay/tdc",
    payload,
  );
  return data;
};

/** Respuesta de GET /international-pay/:orderId (StatusResponse del backend). */
export type InternacionalPaymentStatusResponse = {
  orderId?: string;
  status?: string;
  exitoso?: boolean;
  codigoTransaccion?: string | null;
  mensaje?: string | null;
  data?: unknown;
  // La pasarela puede añadir campos; se conserva el índice para no romper.
  [key: string]: unknown;
};

/**
 * El cobro se completó pero la póliza no se pudo crear. Es crítico
 * distinguirlo de un pago fallido: al cliente YA se le cobró, así que
 * decirle "reintenta" provocaría un doble cargo.
 */
export class PagoCobradoSinPolizaError extends Error {
  readonly idPago: string;
  readonly causa: unknown;

  constructor(idPago: string, causa: unknown) {
    super(
      "El pago se procesó correctamente, pero no se pudo emitir la póliza. " +
        "No vuelvas a pagar: nuestro equipo la emitirá con tu comprobante.",
    );
    this.name = "PagoCobradoSinPolizaError";
    this.idPago = idPago;
    this.causa = causa;
    Object.setPrototypeOf(this, PagoCobradoSinPolizaError.prototype);
  }
}

export const getInternacionalPaymentStatus = async (
  orderId: string,
): Promise<InternacionalPaymentStatusResponse> => {
  const { data } = await axiosClient.get<InternacionalPaymentStatusResponse>(
    `/international-pay/${orderId}`,
  );
  return data;
};

type ProcessPaymentParams = {
  pagoMovil: PagoMovilPayload;
  polizaBase: Omit<PolizaPayload, "idPago">;
};

export const processPagoMovilAndCreatePoliza = async ({
  pagoMovil,
  polizaBase,
}: ProcessPaymentParams): Promise<{
  pago: PagoMovilResponse;
  poliza: unknown;
}> => {
  const pago = await createPagoMovil(pagoMovil);

  if (!pago?.idPago) {
    throw new Error("La API no devolvio idPago en la respuesta de /PM");
  }

  // A partir de aquí el pago ya está verificado y registrado: un fallo de la
  // póliza no debe presentarse como "el pago no se pudo procesar".
  try {
    const poliza = await createPoliza({
      ...polizaBase,
      idPago: String(pago.idPago),
    });
    return { pago, poliza };
  } catch (error) {
    throw new PagoCobradoSinPolizaError(String(pago.idPago), error);
  }
};

type ProcessTdcNacionalParams = {
  tdcNacional: TdcNacionalPayload;
  polizaBase: Omit<PolizaPayload, "idPago">;
};

export const processTdcNacionalAndCreatePoliza = async ({
  tdcNacional,
  polizaBase,
}: ProcessTdcNacionalParams): Promise<{
  tdc: TdcNacionalResponse;
  poliza: unknown;
}> => {
  const tdc = await createTdcNacional(tdcNacional);

  if (!tdc?.ok || !tdc?.aprobado) {
    throw new Error(tdc?.mensaje_sistema ?? "Pago con tarjeta no aprobado");
  }

  if (!tdc?.idPago) {
    throw new Error("La API no devolvio idPago en la respuesta de /tdc-nacional");
  }

  // La tarjeta ya fue cobrada: si falla la póliza hay que decirlo con claridad
  // en vez de invitar a reintentar y provocar un segundo cargo.
  try {
    const poliza = await createPoliza({
      ...polizaBase,
      idPago: String(tdc.idPago),
    });
    return { tdc, poliza };
  } catch (error) {
    throw new PagoCobradoSinPolizaError(String(tdc.idPago), error);
  }
};

