const InfoSection = () => {
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

  return (
    <div className=" p-6 md:p-10 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-[#2B7A57] mb-6">Mi Perfil</h1>

      {/* Perfil resumido */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <img
            src="/assets/user-avatar.png"
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

      {/* Información personal */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Información Personal</h3>
          <button className="text-sm text-white bg-[#2B7A57] px-3 py-1 rounded hover:bg-[#247e5c]">
            Editar
          </button>
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
          <button className="text-sm text-white bg-[#2B7A57] px-3 py-1 rounded hover:bg-[#247e5c]">
            Editar
          </button>
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
  );
};

export default InfoSection;
