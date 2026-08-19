import InputForm from "../commons/InputForm";
import mail from "../../assets/email_icon.png";
import lock from "../../assets/lock_icon.png";
import phone from "../../assets/phone_icon.png";
import id from "../../assets/id_icon.png";
import name from "../../assets/name_icon.png";
import calendar from "../../assets/calendar_icon.png";
import ticket from "../../assets/ticket_icon.png";
import { Link, useNavigate } from "react-router-dom";
import { useAxios } from "../../hook/useAxios";
import { useEffect, useState, useCallback } from "react";
import { normalizeApiError } from "../../api/errors";

type Usuario = {
  ci: string;
  correo: string;
  password: string;
  fk_rol: string;
  vendedores: string;
};

// Respuesta esperada al crear usuario
type UsuarioResponse = {
  user: {
    idUser: string | number;
    ci: string;
    correo: string;
    password: string;
  };
};

type Cliente = {
  pNombre: string;
  sNombre: string;
  pApellido: string;
  sApellido: string;
  fechaNacimiento: string;
  sexo: string;
  telefono: string;
  direccion: string;
  lugar: string; // id del estado (como string)
  fk_user: string;
};

const FormSignUp = () => {
  const { execute: execUser } = useAxios<UsuarioResponse>("/usuario", {
    method: "POST",
    manual: true,
  });

  const { execute: execCliente } = useAxios("/cliente", {
    method: "POST",
    manual: true,
  });

  // Endpoints esperados:
  // - GET /lugar/estados

  // Respuesta backend: { states: [{ idLugar, nombre, ...}] }
  type Option = { id: string | number; nombre: string };

  const { execute: execEstados } = useAxios<Option[]>("/lugar/estados", {
    method: "GET",
    manual: true,
  });

  const [estados, setEstados] = useState<Option[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const navigate = useNavigate();

  // Local state
  const [form, setForm] = useState({
    pnombre: "",
    snombre: "",
    papellido: "",
    sapellido: "",
    telefono: "",
    nacionalidad: "",
    ci: "",
    sexo: "",
    fechaNacimiento: "",
    direccion: "",

    // solo estado
    idEstado: "",

    // lugar = nombre del estado
    lugar: "",

    correo: "",
    correoConfirm: "",
    password: "",
    referido: "",
  });

  const normalizeOptions = useCallback((res: unknown): Option[] => {
    const toOptionArray = (arr: unknown[]): Option[] =>
      arr
        .map((x) => {
          if (!x || typeof x !== "object") return null;
          const anyX = x as Record<string, unknown>;
          const id =
            (anyX.id as string | number | undefined) ??
            (anyX.idLugar as string | number | undefined);
          const nombre = (anyX.nombre as string | undefined) ?? "";
          if (id === undefined || nombre === "") return null;
          return { id, nombre } as Option;
        })
        .filter(Boolean) as Option[];

    if (Array.isArray(res)) return toOptionArray(res);

    if (res && typeof res === "object") {
      const anyRes = res as Record<string, unknown>;
      const candidates = [anyRes.data, anyRes.states, anyRes.estados];
      for (const c of candidates) {
        if (Array.isArray(c)) return toOptionArray(c);
      }
    }

    return [];
  }, []);

  useEffect(() => {
    // Cargar estados solo una vez al montar.
    let cancelled = false;

    const fetchEstados = async () => {
      try {
        const res = await execEstados();
        if (!cancelled) setEstados(normalizeOptions(res));
      } catch (err) {
        console.error(err);
        if (!cancelled) setEstados([]);
      }
    };

    fetchEstados();

    return () => {
      cancelled = true;
    };
    // `execEstados` ahora es estable (useAxios lo memoiza por `url`), así
    // que es seguro incluirlo sin causar loops.
  }, [execEstados, normalizeOptions]);

  useEffect(() => {
    // lugar = id del estado seleccionado (se envía como string)
    setForm((prev) => ({ ...prev, lugar: String(form.idEstado || "") }));
  }, [form.idEstado]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    // Basic validations
    if (
      !form.pnombre ||
      !form.papellido ||
      !form.telefono ||
      !form.nacionalidad ||
      !form.ci ||
      !form.sexo ||
      !form.fechaNacimiento ||
      !form.idEstado ||
      !form.direccion ||
      !form.correo ||
      !form.password
    ) {
      setSubmitError("Por favor completa los campos requeridos.");
      return;
    }
    if (form.correo !== form.correoConfirm) {
      setSubmitError("El correo y su confirmación no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1) Registrar usuario
      const usuarioPayload: Usuario = {
        ci: `${form.nacionalidad}${form.ci}`,
        correo: form.correo,
        password: form.password,
        fk_rol: "1", // rol cliente
        vendedores: form.referido || "",
      };

      const usuarioRes = await execUser({ data: usuarioPayload });
      const userId = usuarioRes?.user.idUser;
      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario creado.");
      }

      // 2) Registrar cliente con fk_user
      const clientePayload: Cliente = {
        pNombre: form.pnombre,
        sNombre: form.snombre,
        pApellido: form.papellido,
        sApellido: form.sapellido,
        telefono: form.telefono,
        fechaNacimiento: form.fechaNacimiento,
        sexo: form.sexo,

        // direccion = la dirección detallada escrita por el usuario
        direccion: form.direccion,

        // lugar = id del estado
        lugar: String(form.idEstado),

        fk_user: String(userId),
      };

      await execCliente({ data: clientePayload });
      setSubmitSuccess("Registro exitoso. Redirigiendo al login...");
      navigate("/login", { replace: true });
    } catch (err) {
      const serverMsg = normalizeApiError(err, "Error al registrar. Intenta nuevamente.");
      const isDuplicate = serverMsg.toLowerCase().includes("duplicate key value");
      const friendlyMsg = isDuplicate
        ? "Ya existe un usuario con esos datos (correo o cédula). Usa otros datos o inicia sesión."
        : serverMsg;

      console.error("Registro fallido", err);
      setSubmitError(friendlyMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full lg:w-1/2 p-5 xl:px-25 lg:px-10 md:px-25 h-fit">
      <div className="">
        <span className="text-[#2B7A57] font-bold text-3xl">
          <Link to={"/"}>TKUIDO</Link>
        </span>
        {/* <img src="/logo.svg" alt="TKUIDO Logo" className="w-20 mb-4" /> */}
        <h2 className="resp-h2 mb-6">Regístrate</h2>

        <form className=" grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <div>
            <InputForm
              title="Primer nombre"
              placeholder="Ingresa tu primer nombre"
              img={name}
              required
              name="pnombre"
              value={form.pnombre}
              onChange={handleChange}
            />
          </div>
          <div>
            <InputForm
              title="Segundo nombre"
              placeholder="Ingresa tu segundo nombre"
              img={name}
              required={false}
              name="snombre"
              value={form.snombre}
              onChange={handleChange}
            />
          </div>
          <div>
            <InputForm
              title="Primer apellido"
              placeholder="Ingresa tu primer apellido"
              img={name}
              required
              name="papellido"
              value={form.papellido}
              onChange={handleChange}
            />
          </div>
          <div>
            <InputForm
              title="Segundo apellido"
              placeholder="Ingresa tu segundo apellido"
              img={name}
              required={false}
              name="sapellido"
              value={form.sapellido}
              onChange={handleChange}
            />
          </div>
          <div>
            <InputForm
              title="Teléfono"
              placeholder="Ingresa tu teléfono"
              type="tel"
              img={phone}
              required
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
            />
          </div>
          <div>
            <label
              htmlFor="signup-nacionalidad"
              className="block mb-1 text-sm font-medium text-gray-900"
            >
              Nacionalidad<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <img
                src={id}
                alt=""
                aria-hidden="true"
                className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
              />
              <select
                id="signup-nacionalidad"
                name="nacionalidad"
                value={form.nacionalidad}
                onChange={handleChange}
                required
                className="text-sm lg:text-base pl-10 pr-4 py-2 w-full bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="" disabled>
                  Selecciona nacionalidad
                </option>
                <option value="V">Venezolano</option>
                <option value="E">Extranjero</option>
                <option value="P">Pasaporte</option>
                <option value="J">Jurídico</option>
                <option value="C">Comuna</option>
                <option value="G">Gubernamental</option>
                <option value="R">Firma Personal</option>
              </select>
            </div>
          </div>
          <div>
            <InputForm
              title="Cédula"
              placeholder="Ingresa tu cédula"
              type="text"
              img={id}
              required
              name="ci"
              value={form.ci}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="signup-sexo"
              className="block mb-1 text-sm font-medium text-gray-900"
            >
              Sexo<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <img
                src={id}
                alt=""
                aria-hidden="true"
                className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
              />
              <select
                id="signup-sexo"
                name="sexo"
                value={form.sexo}
                onChange={handleChange}
                required
                className="text-sm lg:text-base pl-10 pr-4 py-2 w-full bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="" disabled>
                  Selecciona tu sexo
                </option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <InputForm
              title="Fecha de nacimiento"
              placeholder="Ingresa tu fecha de nacimiento"
              type="date"
              img={calendar}
              required
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={handleChange}
            />
          </div>

          <div className="col-[1/3] grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <label
                htmlFor="signup-idEstado"
                className="block mb-1 text-sm font-medium text-gray-900"
              >
                Estado<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <img
                  src={id}
                  alt=""
                  aria-hidden="true"
                  className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                />
                <select
                  id="signup-idEstado"
                  name="idEstado"
                  value={form.idEstado}
                  onChange={handleChange}
                  required
                  className="text-sm lg:text-base pl-10 pr-4 py-2 w-full bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="" disabled>
                    Selecciona estado
                  </option>
                  {estados.map((x) => (
                    <option key={String(x.id)} value={String(x.id)}>
                      {x.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-[1/3]">
              <InputForm
                title="Dirección detallada"
                placeholder="Ej: Calle 10, Casa #5, Sector Centro"
                type="text"
                img={id}
                required
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-[1/3]">
            <InputForm
              title="Correo Electrónico"
              placeholder="Ingresa tu correo electrónico"
              type="email"
              img={mail}
              required
              name="correo"
              value={form.correo}
              onChange={handleChange}
            />
          </div>
          <div className="col-[1/3]">
            <InputForm
              title="Confirmación del Correo Electrónico"
              placeholder="Ingresa tu correo electrónico nuevamente"
              type="email"
              img={mail}
              required
              name="correoConfirm"
              value={form.correoConfirm}
              onChange={handleChange}
            />
          </div>
          <div className="col-[1/3]">
            <InputForm
              title="Contraseña"
              placeholder="Ingresa tu contraseña"
              type="password"
              img={lock}
              required
              name="password"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div className="col-[1/3]">
            <InputForm
              title="Código de referido"
              placeholder="Ingresa el código de referido"
              type="text"
              img={ticket}
              required={false}
              name="referido"
              value={form.referido}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col col-[1/3]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center text-white font-semibold text-base px-6 h-12 rounded-xl transition bg-[#2B7A57] hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Registrando..." : "Registrarse"}
            </button>
          </div>

          {submitError && (
            <div className="col-span-2 text-red-600 text-sm font-medium">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="col-span-2 text-green-600 text-sm font-medium">
              {submitSuccess}
            </div>
          )}
        </form>

        <div className="mt-4 text-sm text-center lg:text-left">
          Ya estas registrado?{" "}
          <Link
            to={"/login"}
            className="text-[#35AE74] font-medium hover:underline"
          >
            Ingresa aquí
          </Link>
        </div>

        {/* <div className="flex space-x-4 mt-6 justify-center">
            <button className="p-3 bg-white border rounded-full shadow"></button>
            <button className="p-3 bg-white border rounded-full shadow"></button>
            <button className="p-3 bg-white border rounded-full shadow"></button>
          </div> */}
      </div>
    </div>
  );
};

export default FormSignUp;
