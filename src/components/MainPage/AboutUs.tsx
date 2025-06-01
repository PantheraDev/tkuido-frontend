import familia from "../../assets/Familia.png";

const AboutUs = () => {
  return (
    <section className="container mx-auto py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="uppercase text-sm text-[#2B7A57] font-semibold tracking-wide">
            Sobre nosotros
          </span>
          <h2 className="resp-h2 text-gray-900 mt-2 mb-4">
            Comprometidos con tu salud y bienestar familiar
          </h2>

          <p className="resp-p mb-8">
            En <strong>TKUIDO</strong>, combinamos tecnología médica y
            sensibilidad humana para ofrecer un servicio integral de{" "}
            <strong>telemedicina en línea</strong> y{" "}
            <strong>cobertura funeraria nacional</strong>. Nuestro enfoque se
            centra en brindar atención médica confiable las 24 horas del día,
            así como respaldo emocional y logístico en los momentos más
            difíciles.
          </p>

          <div className="grid grid-cols-2 gap-6 text-[#2B7A57] font-semibold">
            <div>
              <p className="text-2xl">24/7</p>
              <p className="text-sm text-gray-600">
                Asistencia médica inmediata
              </p>
            </div>
            <div>
              <p className="text-2xl">+10.000</p>
              <p className="text-sm text-gray-600">Usuarios protegidos</p>
            </div>
            <div>
              <p className="text-2xl">100%</p>
              <p className="text-sm text-gray-600">Cobertura nacional</p>
            </div>
            <div>
              <p className="text-2xl">+5 años</p>
              <p className="text-sm text-gray-600">
                de experiencia en el sector
              </p>
            </div>
          </div>
        </div>

        <div>
          <img
            src={familia}
            alt="Equipo médico y logístico de TKUIDO"
            className="rounded-xl shadow-md"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
