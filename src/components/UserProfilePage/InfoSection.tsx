import { useCallback, useEffect, useMemo, useState } from "react";
import { useAxios } from "../../hook/useAxios";
import Button from "../commons/Button";
import { getUserIdFromToken } from "../../utils/auth";
import { normalizeApiError } from "../../api/errors";
import { generarPolizaPdf } from "../../utils/polizaPdf";

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
  plan?: { idPlan?: number | string; nombre?: string } | null;
  pagos?: Pago[];
};

type ClientePerfil = {
  id: string;
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

type EstadoOption = { id: string; nombre: string };

type PersonalForm = {
  pNombre: string;
  sNombre: string;
  pApellido: string;
  sApellido: string;
  telefono: string;
  fechaNacimiento: string;
  sexo: string;
};

type DireccionForm = {
  direccion: string;
  lugar: string; // id del estado, igual que en el registro
};

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-600";
const labelClass = "block mb-1 text-xs font-medium text-gray-600";

// `lugar` llega como Result serializado ({ value, error }) o como el lugar
// plano; devolvemos el objeto Lugar si se puede extraer.
const extractLugar = (lugar: ClientePerfil["lugar"]): Lugar | null => {
  if (!lugar || typeof lugar !== "object") return null;
  const candidate = "value" in lugar ? lugar.value : lugar;
  if (candidate && typeof candidate === "object" && "nombre" in candidate) {
    return candidate as Lugar;
  }
  return null;
};

// El input date necesita YYYY-MM-DD; el backend puede mandar un ISO completo.
const toDateInput = (value?: string) => (value ? value.slice(0, 10) : "");

const InfoSection = () => {
  const { execute, loading, error } = useAxios<PerfilResponse>(
    "/cliente/perfil/",
    {
      method: "GET",
      manual: true,
    },
  );

  const { execute: execUpdate } = useAxios("/cliente/update", {
    method: "PUT",
    manual: true,
  });

  const { execute: execEstados } = useAxios<
    Array<{ idLugar?: string | number; id?: string | number; nombre?: string }>
  >("/lugar/estados", { method: "GET", manual: true });

  const [user, setUser] = useState<ClientePerfil | null>(null);

  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingDireccion, setEditingDireccion] = useState(false);
  const [personalForm, setPersonalForm] = useState<PersonalForm | null>(null);
  const [direccionForm, setDireccionForm] = useState<DireccionForm | null>(
    null,
  );
  const [estados, setEstados] = useState<EstadoOption[]>([]);
  const [saving, setSaving] = useState<"personal" | "direccion" | null>(null);
  const [saveError, setSaveError] = useState<{
    section: "personal" | "direccion";
    message: string;
  } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState("");

  const fetchPerfil = useCallback(async () => {
    const userId = getUserIdFromToken();
    if (!userId) return null;
    return execute({ url: `/cliente/perfil/${userId}` });
  }, [execute]);

  useEffect(() => {
    let cancelled = false;

    fetchPerfil()
      .then((response) => {
        if (!cancelled && response) setUser(response);
      })
      .catch((e) => {
        if (!cancelled) console.error(e);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchPerfil]);

  const loadEstados = useCallback(async () => {
    if (estados.length > 0) return;
    try {
      const res = await execEstados();
      const list = Array.isArray(res) ? res : [];
      setEstados(
        list
          .map((x) => ({
            id: String(x.idLugar ?? x.id ?? ""),
            nombre: x.nombre ?? "",
          }))
          .filter((x) => x.id && x.nombre),
      );
    } catch (e) {
      console.error(e);
    }
  }, [estados.length, execEstados]);

  const startEditPersonal = () => {
    if (!user) return;
    setSaveError(null);
    setSaveSuccess("");
    setPersonalForm({
      pNombre: user.pNombre ?? "",
      sNombre: user.sNombre ?? "",
      pApellido: user.pApellido ?? "",
      sApellido: user.sApellido ?? "",
      telefono: user.telefono ?? "",
      fechaNacimiento: toDateInput(user.fechaNacimiento),
      sexo: user.sexo ?? "",
    });
    setEditingPersonal(true);
  };

  const startEditDireccion = () => {
    if (!user) return;
    setSaveError(null);
    setSaveSuccess("");
    const lugar = extractLugar(user.lugar);
    setDireccionForm({
      direccion: user.direccion ?? "",
      lugar: lugar ? String(lugar.idLugar) : "",
    });
    setEditingDireccion(true);
    loadEstados();
  };

  const handlePersonalChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setPersonalForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleDireccionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setDireccionForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const saveCliente = async (
    section: "personal" | "direccion",
    data: Partial<PersonalForm & DireccionForm>,
  ) => {
    if (!user?.id) return false;
    setSaving(section);
    setSaveError(null);
    setSaveSuccess("");
    try {
      await execUpdate({ url: `/cliente/update/${user.id}`, data });
      const refreshed = await fetchPerfil();
      if (refreshed) setUser(refreshed);
      setSaveSuccess("Datos actualizados correctamente.");
      return true;
    } catch (e) {
      setSaveError({
        section,
        message: normalizeApiError(
          e,
          "No se pudieron guardar los cambios. Intenta nuevamente.",
        ),
      });
      return false;
    } finally {
      setSaving(null);
    }
  };

  const submitPersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalForm) return;
    if (
      !personalForm.pNombre.trim() ||
      !personalForm.pApellido.trim() ||
      !personalForm.telefono.trim() ||
      !personalForm.fechaNacimiento ||
      !personalForm.sexo
    ) {
      setSaveError({
        section: "personal",
        message: "Por favor completa los campos requeridos.",
      });
      return;
    }
    const ok = await saveCliente("personal", {
      ...personalForm,
      pNombre: personalForm.pNombre.trim(),
      sNombre: personalForm.sNombre.trim(),
      pApellido: personalForm.pApellido.trim(),
      sApellido: personalForm.sApellido.trim(),
    });
    if (ok) setEditingPersonal(false);
  };

  const submitDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!direccionForm) return;
    if (!direccionForm.direccion.trim() || !direccionForm.lugar) {
      setSaveError({
        section: "direccion",
        message: "Por favor completa los campos requeridos.",
      });
      return;
    }
    const ok = await saveCliente("direccion", {
      direccion: direccionForm.direccion.trim(),
      lugar: direccionForm.lugar,
    });
    if (ok) setEditingDireccion(false);
  };

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

  const handleVerDetalles = async (poliza: Poliza) => {
    setPdfError("");
    setPdfLoadingId(String(poliza.idPoliza));
    try {
      await generarPolizaPdf(poliza, {
        nombreCompleto: fullName,
        cedula: user?.idUser?.ci,
        correo: user?.idUser?.correo,
        telefono: user?.telefono,
        direccion: user?.direccion,
        estado: estadoNombre,
      });
    } catch (e) {
      console.error(e);
      setPdfError(
        "No se pudo generar el PDF de la póliza. Intenta nuevamente.",
      );
    } finally {
      setPdfLoadingId(null);
    }
  };

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
            <h2 className="text-lg font-semibold capitalize">
              {fullName || "-"}
            </h2>
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
            {!editingPersonal && (
              <Button
                text="Editar"
                color="#2B7A57"
                onClick={startEditPersonal}
                disabled={!user?.id}
              />
            )}
          </div>
          {editingPersonal && personalForm ? (
            <form
              onSubmit={submitPersonal}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label htmlFor="perfil-pNombre" className={labelClass}>
                  Nombre<span className="text-red-500">*</span>
                </label>
                <input
                  id="perfil-pNombre"
                  name="pNombre"
                  value={personalForm.pNombre}
                  onChange={handlePersonalChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="perfil-sNombre" className={labelClass}>
                  Segundo nombre
                </label>
                <input
                  id="perfil-sNombre"
                  name="sNombre"
                  value={personalForm.sNombre}
                  onChange={handlePersonalChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="perfil-pApellido" className={labelClass}>
                  Apellido<span className="text-red-500">*</span>
                </label>
                <input
                  id="perfil-pApellido"
                  name="pApellido"
                  value={personalForm.pApellido}
                  onChange={handlePersonalChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="perfil-sApellido" className={labelClass}>
                  Segundo apellido
                </label>
                <input
                  id="perfil-sApellido"
                  name="sApellido"
                  value={personalForm.sApellido}
                  onChange={handlePersonalChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="perfil-telefono" className={labelClass}>
                  Teléfono<span className="text-red-500">*</span>
                </label>
                <input
                  id="perfil-telefono"
                  name="telefono"
                  type="tel"
                  value={personalForm.telefono}
                  onChange={handlePersonalChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="perfil-fechaNacimiento" className={labelClass}>
                  Fecha de Nacimiento<span className="text-red-500">*</span>
                </label>
                <input
                  id="perfil-fechaNacimiento"
                  name="fechaNacimiento"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={personalForm.fechaNacimiento}
                  onChange={handlePersonalChange}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="perfil-sexo" className={labelClass}>
                  Sexo<span className="text-red-500">*</span>
                </label>
                <select
                  id="perfil-sexo"
                  name="sexo"
                  value={personalForm.sexo}
                  onChange={handlePersonalChange}
                  required
                  className={inputClass}
                >
                  <option value="" disabled>
                    Selecciona tu sexo
                  </option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>
              <p className="md:col-span-2 text-xs text-gray-500">
                La cédula y el correo no se pueden modificar desde aquí.
              </p>
              {saveError?.section === "personal" && (
                <p className="md:col-span-2 text-sm text-red-600">
                  {saveError.message}
                </p>
              )}
              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPersonal(false);
                    setSaveError(null);
                  }}
                  disabled={saving === "personal"}
                  className="px-5 h-11 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-70"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving === "personal"}
                  className="px-5 h-11 rounded-xl text-white font-semibold bg-[#2B7A57] hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving === "personal" ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          ) : (
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
          )}
        </div>

        {/* Dirección */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Dirección</h3>
            {!editingDireccion && (
              <Button
                text="Editar"
                color="#2B7A57"
                onClick={startEditDireccion}
                disabled={!user?.id}
              />
            )}
          </div>
          {editingDireccion && direccionForm ? (
            <form onSubmit={submitDireccion} className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="perfil-lugar" className={labelClass}>
                  Estado<span className="text-red-500">*</span>
                </label>
                <select
                  id="perfil-lugar"
                  name="lugar"
                  value={direccionForm.lugar}
                  onChange={handleDireccionChange}
                  required
                  className={inputClass}
                >
                  <option value="" disabled>
                    {estados.length === 0
                      ? "Cargando estados..."
                      : "Selecciona estado"}
                  </option>
                  {estados.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="perfil-direccion" className={labelClass}>
                  Dirección detallada<span className="text-red-500">*</span>
                </label>
                <input
                  id="perfil-direccion"
                  name="direccion"
                  value={direccionForm.direccion}
                  onChange={handleDireccionChange}
                  placeholder="Ej: Calle 10, Casa #5, Sector Centro"
                  required
                  className={inputClass}
                />
              </div>
              {saveError?.section === "direccion" && (
                <p className="text-sm text-red-600">{saveError.message}</p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDireccion(false);
                    setSaveError(null);
                  }}
                  disabled={saving === "direccion"}
                  className="px-5 h-11 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-70"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving === "direccion"}
                  className="px-5 h-11 rounded-xl text-white font-semibold bg-[#2B7A57] hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving === "direccion" ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <p className="md:col-span-2">
                <strong>Dirección:</strong> {user?.direccion || "-"}
              </p>
              <p>
                <strong>Estado:</strong> {estadoNombre || "-"}
              </p>
            </div>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-6 text-sm text-green-700" role="status">
          {saveSuccess}
        </div>
      )}

      {/* Pólizas */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Mis Pólizas</h3>
        </div>
        {pdfError && (
          <div className="mb-4 text-sm text-red-600" role="alert">
            {pdfError}
          </div>
        )}

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
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-700">
                        <strong>Estado:</strong> {poliza.estado || "-"}
                      </div>
                      <Button
                        text="Ver detalles"
                        color="#2B7A57"
                        className="flex items-center justify-center text-white font-semibold text-sm px-4 h-10 rounded-xl transition"
                        onClick={() => handleVerDetalles(poliza)}
                        loading={pdfLoadingId === String(poliza.idPoliza)}
                        loadingText="Generando PDF..."
                        disabled={pdfLoadingId !== null}
                        title="Descargar el detalle de la póliza en PDF"
                      />
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
                      <strong>Suma asegurada:</strong>{" "}
                      {poliza.sumaAsegurada ?? "-"}
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
