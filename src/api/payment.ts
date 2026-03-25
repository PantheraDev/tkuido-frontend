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
} => {
  const idCliente =
    toStringValue(perfil.id) ??
    toStringValue(perfil.idCliente) ??
    toStringValue(perfil.id_cliente) ??
    toStringValue(perfil.clienteId);

  return { idCliente };
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
