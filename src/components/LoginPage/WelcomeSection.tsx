const WelcomeSection = () => {
  return (
    <div className="hidden lg:flex w-full lg:w-1/2 bg-[url('../assets/FondoAbout.png')] rounded-2xl shadow-2xl text-white flex-col justify-center items-center p-10 relative">
      <span className="text-white font-bold text-3xl">TKUIDO</span>
      <h1 className="text-3xl font-semibold mb-4">Bienvenido a TKUIDO</h1>
      <p className="text-center max-w-md mb-4">
        En TKUIDO cuidamos tu salud y protegemos a tu familia estés donde estés.
        Únete y comienza a disfrutar hoy de nuestros servicios.
      </p>
      <p className="text-sm text-[#d9f2e1] mb-6">
        Más de 17k personas ya forman parte. Es tu turno.
      </p>

      <div className="bg-[#207b52] border-[#196343] shadow p-4 rounded-2xl flex items-center justify-between w-80">
        <div className="">
          <h3 className="text-sm font-semibold">Únete a nuestros usuarios</h3>
          <p className="text-xs text-white">
            Comienza la forma más sencilla de acceder a la salud y protección.
          </p>
        </div>
        <div className="w-full flex -space-x-2">
          <img
            src="https://unavatar.io/x/"
            className="w-8 h-8 rounded-full border-2 border-white"
            alt="user1"
          />
          <img
            src="https://unavatar.io/x/elonmusk"
            className="w-8 h-8 rounded-full border-2 border-white"
            alt="user2"
          />
          <img
            src="https://unavatar.io/x/eva"
            className="w-8 h-8 rounded-full border-2 border-white"
            alt="user3"
          />
          <div className="w-8 h-8 bg-[#35AE74] text-white rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white">
            +2
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
