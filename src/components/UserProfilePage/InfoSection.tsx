import { useEffect, useMemo, useState } from "react";
import { useAxios } from "../../hook/useAxios";
import Button from "../commons/Button";
import { getUserIdFromToken } from "../../utils/auth";

type Lugar = {
  idLugar: number | string;
  nombre: string;
  tipo?: string;
};

type UsuarioObj = {
  idUsuario: string;
  ci: string;
  correo: string;
  // ...otros campos
};

type Producto = {
  idProducto: number | string;
  nombre?: string;
  nombreComercial?: string;
  descripcion?: string;
  tipo?: string | number;
};

type Pago = {
  idPago: number | string;
  fecha?: string;
  monto?: string | number;
  polizaId?: number | string | null;
};

type Poliza = {
  idPoliza: number | string;
  fechaInicio?: string;
  fechaFin?: string;
  prima?: string | number;
  sumaAsegurada?: string | number;
  deducible?: string | number;
  estado?: string;
  rutaDocumento?: string;
  producto?: Producto | null;
  pagos?: Pago[];
};

type ClientePerfil = {
  pNombre: string;
  sNombre: string;
  pApellido: string;
  sApellido: string;
  fechaNacimiento: string;
  sexo: string;
  telefono: string;
  direccion: string;
  lugar: { value: Lugar; error: unknown } | Lugar | string | number | null;
  idUser: UsuarioObj;
  polizas: Poliza[];
  pagos: Pago[];
};

type PerfilResponse = ClientePerfil;

const InfoSection = () => {
  const { execute, loading, error } = useAxios<PerfilResponse>(
    "/cliente/perfil/",
    {
      method: "GET",
      manual: true,
    },
  );

  const [user, setUser] = useState<ClientePerfil | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPerfil = async () => {
      const userId = getUserIdFromToken();
      if (!userId) return;

      try {
        const response = await execute({
          url: `/cliente/perfil/${userId}`,
        });

        if (!cancelled) {
          setUser(response);
        }
      } catch (e) {
        if (!cancelled) console.error(e);
      }
    };

    fetchPerfil();

    return () => {
      cancelled = true;
    };
    // `execute` ahora es estable (useAxios lo memoiza por `url`), así que es
    // seguro incluirlo sin causar loops.
  }, [execute]);

  const fullName = useMemo(() => {
    if (!user) return "";
    return [user.pNombre, user.sNombre, user.pApellido, user.sApellido]
      .filter(Boolean)
      .join(" ");
  }, [user]);

  const estadoNombre = useMemo(() => {
    if (!user?.lugar) return "";

    const lugar = user.lugar;

    if (typeof lugar === "string" || typeof lugar === "number") {
      return String(lugar);
    }

    if (typeof lugar === "object") {
      // Caso: { value: { nombre: ... }, error: ... }
      if ("value" in lugar) {
        const v = (lugar as { value?: unknown }).value;
        if (v && typeof v === "object" && "nombre" in v) {
          return String((v as { nombre?: unknown }).nombre ?? "");
        }
      }

      // Caso: { nombre: ... }
      if ("nombre" in lugar) {
        return String((lugar as { nombre?: unknown }).nombre ?? "");
      }
    }

    return "";
  }, [user]);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  const formatMoney = (value?: string | number) => {
    if (value === undefined || value === null || value === "") return "-";
    const n = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(n)) return String(value);
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(n);
  };

  const polizas = useMemo(() => user?.polizas ?? [], [user]);
  const pagos = useMemo(() => user?.pagos ?? [], [user]);

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-[#2B7A57] mb-6">Mi Perfil</h1>

      {loading && (
        <div className="mb-4 text-sm text-gray-600">Cargando perfil...</div>
      )}
      {error && (
        <div className="mb-4 text-sm text-red-600">
          Error cargando perfil. Revisa tu sesión.
        </div>
      )}

      {/* Perfil resumido */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          
          <div>
            <h2 className="text-lg font-semibold capitalize">{fullName || "-"}</h2>
            <p className="text-sm text-gray-500">Cliente</p>
            <p className="text-sm text-gray-500">
              {user?.direccion || "-"} {estadoNombre ? `, ${estadoNombre}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Información Personal + Dirección en dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Información personal */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Información Personal</h3>
            <Button text="Editar" color="#2B7A57" disabled title="Próximamente" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 capitalize">
            <p>
              <strong>Nombre:</strong> {user?.pNombre || "-"}
            </p>
            <p>
              <strong>Segundo nombre:</strong> {user?.sNombre || "-"}
            </p>
            <p>
              <strong>Apellido:</strong> {user?.pApellido || "-"}
            </p>
            <p>
              <strong>Segundo apellido:</strong> {user?.sApellido || "-"}
            </p>
            <p>
              <strong>Cédula:</strong> {user?.idUser?.ci || "-"}
            </p>
            <p>
              <strong>Teléfono:</strong> {user?.telefono || "-"}
            </p>
            <p>
              <strong>Correo:</strong> {user?.idUser?.correo || "-"}
            </p>
            <p>
              <strong>Fecha de Nacimiento:</strong>{" "}
              {user?.fechaNacimiento || "-"}
            </p>
            <p>
              <strong>Sexo:</strong> {user?.sexo || "-"}
            </p>
          </div>
        </div>

        {/* Dirección */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Dirección</h3>
            <Button text="Editar" color="#2B7A57" disabled title="Próximamente" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <p className="md:col-span-2">
              <strong>Dirección:</strong> {user?.direccion || "-"}
            </p>
            <p>
              <strong>Estado:</strong> {estadoNombre || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Pólizas */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Mis Pólizas</h3>
          <Button text="Ver detalles" color="#2B7A57" disabled title="Próximamente" />
        </div>

        {polizas.length === 0 ? (
          <div className="text-sm text-gray-600">No tienes pólizas aún.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {polizas.map((poliza) => {
              const producto = poliza.producto;
              return (
                <div
                  key={String(poliza.idPoliza)}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800 capitalize">
                        {producto?.nombreComercial ||
                          producto?.nombre ||
                          "Producto"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Póliza #{String(poliza.idPoliza)}
                      </p>
                    </div>
                    <div className="text-sm text-gray-700 items-end">
                      <strong>Estado:</strong> {poliza.estado || "-"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm text-gray-700">
                    <p>
                      <strong>Inicio:</strong> {formatDate(poliza.fechaInicio)}
                    </p>
                    <p>
                      <strong>Fin:</strong> {formatDate(poliza.fechaFin)}
                    </p>
                    <p>
                      <strong>Prima:</strong> {poliza.prima ?? "-"}
                    </p>
                    <p>
                      <strong>Suma asegurada:</strong> {poliza.sumaAsegurada ?? "-"}
                    </p>
                    <p>
                      <strong>Deducible:</strong> {poliza.deducible ?? "-"}
                    </p>
                  </div>

                  {poliza.pagos && poliza.pagos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        Pagos de esta póliza
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {poliza.pagos.map((p) => (
                          <div
                            key={String(p.idPago)}
                            className="border border-gray-100 rounded-md p-3"
                          >
                            <p className="text-sm text-gray-700">
                              <strong>Fecha:</strong> {formatDate(p.fecha)}
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong>Monto:</strong> {formatMoney(p.monto)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagos (del perfil) */}
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Pagos</h3>
          <Button text="Ver todos" color="#2B7A57" disabled title="Próximamente" />
        </div>

        {pagos.length === 0 ? (
          <div className="text-sm text-gray-600">No hay pagos registrados.</div>
        ) : (
          <div className="text-sm text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pagos.map((pago) => (
                <div
                  key={String(pago.idPago)}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <p>
                    <strong>Fecha:</strong> {formatDate(pago.fecha)}
                  </p>
                  <p>
                    <strong>Monto:</strong> {formatMoney(pago.monto)}
                  </p>
                  <p>
                    <strong>Póliza:</strong>{" "}
                    {pago.polizaId === null || pago.polizaId === undefined
                      ? "-"
                      : String(pago.polizaId)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoSection;
