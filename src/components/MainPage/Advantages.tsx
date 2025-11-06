import Apoyo from "../../assets/ApoyoFamiliar.svg";
import AccesoRapido from "../../assets/AccesoRapido.svg";
import Funeraria from "../../assets/Funeraria.svg";
import Privacidad from "../../assets/Privacidad.svg";
import Disponibilidad from "../../assets/24_7.svg";
import AdvantagesCard from "../commons/AdvantagesCard";

const font = "Avenir Black";

const Advantages = () => {
  return (
    <section className="container mx-auto lg:my-15">
      <div className="px-6 py-16 grid gap-10 items-center content-center md:grid-cols-2 lg:grid-cols-3 lg:gap-15 xl:gap-20 ">
        <h2 className="resp-h2 text-center md:text-start">
          Beneficion que te ofrece{" "}
          <span className="text-[#35AE74]"style={{ fontFamily: font }}>TKUIDO</span>
        </h2>
        {beneficios.map(({ img, title, description, alt }) => (
          <AdvantagesCard
            key={title}
            image={img}
            title={title}
            description={description}
            alt={alt}
          />
        ))}
      </div>
    </section>
  );
};

export default Advantages;

const beneficios = [
  {
    alt: "Disponibilidad 24/7",
    img: Disponibilidad,
    title: "Telemedicina en línea 24/7",
    description:
      "Accede a consultas médicas en línea en cualquier momento del día, con atención inmediata desde tu celular o computadora. Recibe orientación médica profesional sin salir de casa.",
  },
  {
    alt: "Funerario",
    img: Funeraria,
    title: "Servicio funerario nacional completo",
    description:
      "Contamos con cobertura funeraria en todo el país. Brindamos apoyo emocional y logístico a las familias con servicios integrales que incluyen velatorio, cremación y asistencia personalizada.",
  },
  {
    alt: "Privacidad",
    img: Privacidad,
    title: "Privacidad y seguridad de datos médicos",
    description:
      "Tu información médica está protegida bajo protocolos estrictos de seguridad y confidencialidad. Garantizamos un manejo seguro de tus datos personales y clínicos.",
  },
  {
    alt: "Acceso rápido",
    img: AccesoRapido,
    title: "Acceso fácil desde cualquier dispositivo",
    description:
      "Utiliza nuestra plataforma desde tu teléfono, tablet o computadora. Regístrate en minutos y gestiona tus consultas o servicios de forma simple y rápida, estés donde estés.",
  },
  {
    alt: "Apoyo familiar",
    img: Apoyo,
    title: "Atención integral para ti y tu familia",
    description:
      "TKUIDO combina servicios de salud y protección funeraria en un solo lugar, ofreciéndote tranquilidad en vida y apoyo en los momentos más difíciles.",
  },
];
