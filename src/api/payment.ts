import axiosClient from "./axiosClient";

export type PagoMovilPayload = {
  idCliente: string;
  phone: string;
  bank: string;
  date: string;
  reference: string;
};

export type PagoMovilResponse = {
  idPago: number;
};

export type TdcNacionalPayload = {
  idCliente: string;
  amount: string;
  creditCardNumber: string;
  cvv: string;
  expirationMonth: string;
  expirationYear: string;
  ci: string;
  reference: string;
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

export type TdcInternacionalPayload = {
  idCliente: string;
  Monto: string;
  Descripcion: string;
  Dni: string;
  Name: string;
  token: string;
};

export type TdcInternacionalResponse = {
  idPago: string;
  Amount?: number | string;
  CallbackUrl?: string;
  CallbackUrlCancel?: string;
  Dni?: string;
  Name?: string;
  Status?: string;
  ordenID?: string;
  url?: string;
  [key: string]: unknown;
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

  const poliza = await createPoliza({
    ...polizaBase,
    idPago: String(pago.idPago),
  });

  return { pago, poliza };
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

  const poliza = await createPoliza({
    ...polizaBase,
    idPago: String(tdc.idPago),
  });

  return { tdc, poliza };
};
