import check from "../../assets/check_white_icon.png";

const WelcomeSignUpSection = () => {
  return (
    <div className="hidden lg:flex w-full lg:w-1/2 ">
      <div className="my-5 lg:flex bg-[url('../assets/FondoAbout.png')] rounded-2xl shadow-2xl text-white flex-col justify-center items-center p-10 relative">
        <span className="text-white font-bold text-3xl">TKUIDO</span>

        <h2 className="resp-h2 text-center mb-4">¿Por qué unirte a TKUIDO?</h2>

        <ul className="space-y-3 text-sm mb-6">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <img
                src={check}
                alt="Check icon"
                className="max-w-5 max-h-5 mr-5"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="bg-[#247e5c] p-6 rounded-xl text-sm">
          <p className="mb-2 font-semibold">
            Más de 17.000 personas ya confían en TKUIDO.
          </p>
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
          <p className="mt-2 text-xs opacity-80">
            Únete hoy y forma parte de una comunidad protegida.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSignUpSection;

const items = [
  "Consulta médica en línea disponible 24/7 desde tu celular.",
  "Servicio funerario nacional para proteger a tus seres queridos.",
  "Acceso a historial clínico digital en todo momento.",
  "Soporte humano y seguimiento personalizado.",
];
