import { useEffect, useState } from "react";
import { useAxios } from "../../hook/useAxios";
import Button from "../commons/Button";
import { jwtDecode } from "jwt-decode";

const InfoSection = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const { execute, loading, error } = useAxios("/cliente/one/", {
    method: "GET",
    manual: true,
  });

  // useEffect(async (): Promise<void> => {
  //   const id = extractUserIdFromToken();
  //   if (id) {
  //     const response = await execute({
  //       params: {
  //         id: userId,
  //       },
  //     });
  //     console.log("Respuesta del servidor:", response);
  //   }
  // }, [userId, execute]);

  const extractUserIdFromToken = (): string | null => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = jwtDecode<{ id: string }>(token);
    setUserId(decoded.id.toString());
    return decoded.id;
  };

  const user = {
    nombre: "Carlos",
    apellido: "González",
    fechaNacimiento: "1990-10-12",
    cedula: "V-12345678",
    telefono: "+58 412-1234567",
    correo: "carlosgonzalez@email.com",
    rol: "Usuario",
    direccion: {
      pais: "Venezuela",
      estado: "Distrito Capital",
      ciudad: "Caracas",
      codigoPostal: "1010",
    },
  };

  // Datos adicionales
  const plan = {
    nombre: "Plan Familiar Premium",
    estado: "Activo",
    cobertura: ["Salud", "Funeraria", "Vida"],
    fechaInicio: "2025-01-15",
    fechaRenovacion: "2026-01-15",
    primaMensual: "$12.99",
  };

  const pagos = [
    {
      fecha: "2025-11-01",
      monto: "$12.99",
      metodo: "Tarjeta",
      estado: "Pagado",
    },
    {
      fecha: "2025-10-01",
      monto: "$12.99",
      metodo: "Tarjeta",
      estado: "Pagado",
    },
    {
      fecha: "2025-09-01",
      monto: "$12.99",
      metodo: "Tarjeta",
      estado: "Pagado",
    },
  ];

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-[#2B7A57] mb-6">Mi Perfil</h1>

      {/* Perfil resumido */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <img
            src=""
            alt="Foto de perfil"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg font-semibold">
              {user.nombre} {user.apellido}
            </h2>
            <p className="text-sm text-gray-500">{user.rol}</p>
            <p className="text-sm text-gray-500">
              {user.direccion.ciudad}, {user.direccion.estado}
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
            {/* <button className="text-sm text-white bg-[#2B7A57] px-3 py-1 rounded hover:bg-[#247e5c]">
              Editar
            </button> */}
            <Button text="Editar" color="#2B7A57" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <p>
              <strong>Nombre:</strong> {user.nombre}
            </p>
            <p>
              <strong>Apellido:</strong> {user.apellido}
            </p>
            <p>
              <strong>Cédula:</strong> {user.cedula}
            </p>
            <p>
              <strong>Teléfono:</strong> {user.telefono}
            </p>
            <p>
              <strong>Correo:</strong> {user.correo}
            </p>
            <p>
              <strong>Fecha de Nacimiento:</strong> {user.fechaNacimiento}
            </p>
            <p>
              <strong>Rol:</strong> {user.rol}
            </p>
          </div>
        </div>

        {/* Dirección */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Dirección</h3>
            {/* <button className="text-sm text-white bg-[#2B7A57] px-3 py-1 rounded hover:bg-[#247e5c]">
              Editar
            </button> */}
            <Button text="Editar" color="#2B7A57" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <p>
              <strong>País:</strong> {user.direccion.pais}
            </p>
            <p>
              <strong>Estado:</strong> {user.direccion.estado}
            </p>
            <p>
              <strong>Ciudad:</strong> {user.direccion.ciudad}
            </p>
            <p>
              <strong>Código Postal:</strong> {user.direccion.codigoPostal}
            </p>
          </div>
        </div>
      </div>

      {/* Información del plan en una columna */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Información del Plan</h3>
            <Button text="Ver detalles" color="#2B7A57" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <p>
              <strong>Plan:</strong> {plan.nombre}
            </p>
            <p>
              <strong>Estado:</strong> {plan.estado}
            </p>
            <p>
              <strong>Fecha de Inicio:</strong> {plan.fechaInicio}
            </p>
            <p>
              <strong>Renovación:</strong> {plan.fechaRenovacion}
            </p>
            <p>
              <strong>Prima Mensual:</strong> {plan.primaMensual}
            </p>
            <div>
              <strong>Cobertura:</strong>
              <ul className="list-disc pl-5 mt-1">
                {plan.cobertura.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Pagos anteriores (debajo) */}
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Pagos Anteriores</h3>
          <Button text="Ver todos" color="#2B7A57" />
        </div>
        <div className="text-sm text-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pagos.map((pago, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <p>
                  <strong>Fecha:</strong> {pago.fecha}
                </p>
                <p>
                  <strong>Monto:</strong> {pago.monto}
                </p>
                <p>
                  <strong>Método:</strong> {pago.metodo}
                </p>
                <p>
                  <strong>Estado:</strong> {pago.estado}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
