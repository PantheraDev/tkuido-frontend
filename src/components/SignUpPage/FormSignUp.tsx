import Button from "../commons/Button";
import InputForm from "../commons/InputForm";
import mail from "../../assets/email_icon.png";
import lock from "../../assets/lock_icon.png";
import phone from "../../assets/phone_icon.png";
import id from "../../assets/id_icon.png";
import name from "../../assets/name_icon.png";
import calendar from "../../assets/calendar_icon.png";
import ticket from "../../assets/ticket_icon.png";
import { Link } from "react-router-dom";
import { useAxios } from "../../hook/useAxios";
import { useState } from "react";

type Usuario = {
  ci: string;
  correo: string;
  password: string;
  fk_rol: string;
  vendedores: string;
};

// Respuesta esperada al crear usuario
type UsuarioResponse = {
  id: string | number;
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
  lugar: string;
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

  // Local state
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    ci: "",
    fechaNacimiento: "",
    correo: "",
    correoConfirm: "",
    password: "",
    referido: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Basic validations
    if (
      !form.nombre ||
      !form.apellido ||
      !form.telefono ||
      !form.ci ||
      !form.fechaNacimiento ||
      !form.correo ||
      !form.password
    ) {
      alert("Por favor completa los campos requeridos.");
      return;
    }
    if (form.correo !== form.correoConfirm) {
      alert("El correo y su confirmación no coinciden.");
      return;
    }

    try {
      // 1) Registrar usuario
      const usuarioPayload: Usuario = {
        ci: form.ci,
        correo: form.correo,
        password: form.password,
        fk_rol: "1", // rol cliente
        vendedores: form.referido || "",
      };

      const usuarioRes = await execUser({ data: usuarioPayload });
      const userId = usuarioRes?.id;
      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario creado.");
      }

      // 2) Registrar cliente con fk_user
      const clientePayload: Partial<Cliente> = {
        pNombre: form.nombre,
        sNombre: "",
        pApellido: form.apellido,
        sApellido: "",
        telefono: form.telefono,
        fechaNacimiento: form.fechaNacimiento,
        fk_user: String(userId),
      };

      await execCliente({ data: clientePayload });

      alert("Registro exitoso");
      // window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Error al registrar. Intenta nuevamente.");
    }
  };

  return (
    <div className="w-full lg:w-1/2 p-5 xl:px-25 lg:px-10 md:px-25 h-fit">
      <div className="">
        <span className="text-[#2B7A57] font-bold text-3xl">
          <Link to={"/tkuido-frontend/"}>TKUIDO</Link>
        </span>
        {/* <img src="/logo.svg" alt="TKUIDO Logo" className="w-20 mb-4" /> */}
        <h2 className="resp-h2 mb-6">Regístrate</h2>

        <form className=" grid grid-cols-2 gap-4">
          <div>
            <InputForm
              title="Nombre"
              placeholder="Ingresa tu nombre"
              img={name}
              required
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
            />
          </div>
          <div>
            <InputForm
              title="Apellido"
              placeholder="Ingresa tu apellido"
              img={name}
              required
              name="apellido"
              value={form.apellido}
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
          <div className="col-[1/3]">
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
            <Button text="Registrarse" onClick={handleSubmit} color="#2B7A57" />
          </div>
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
