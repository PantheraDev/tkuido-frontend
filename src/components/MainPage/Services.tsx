import ServiceCard from "../commons/ServiceCard";
import telemedicina from "../../assets/Telemedicina.png";
import paloma from "../../assets/Paloma.png";
import av from "../../assets/AsistenciaVial.png";
import rcv from "../../assets/RCV.png";

const Services = () => {
  return (
    <section className="bg-white py-10 px-5 lg:px-30">
      <h2 className="resp-h2 text-gray-900 mb-10 text-center lg:mb-10">
        Nuestros Servicios
      </h2>
      <div className="grid lg:grid-cols-2 gap-10 ">
        <ServiceCard
          title="Accede a servicios de telemedicina en línea con doctores disponibles en todo momento."
          description="Realiza tu consulta médica desde casa, sin traslados ni salas de espera."
          call="Consulta médica online 24/7"
          img={telemedicina}
        />
        <ServiceCard
          title="Ofrecemos un servicio funerario confiable con cobertura en todo el país."
          description="Te acompañamos con asistencia emocional, logística y humana en los momentos más delicados."
          call="Servicio funerario completo a nivel nacional"
          img={paloma}
        />
        <ServiceCard
          title="Asistencia Vial 24/7 – Servicio de Grúas y Auxilio en Carretera"
          description="Brindamos asistencia vial en todo el país, con servicio de grúas, auxilio mecánico y cambio de neumáticos. Atención rápida y segura las 24 horas."
          call="Solicita tu asistencia vial ahora y viaja con tranquilidad."
          img={av}
        />
        <ServiceCard
          title="Seguro RCV – Responsabilidad Civil Vehicular"
          description="Contrata tu seguro de Responsabilidad Civil Vehicular (RCV) fácil y rápido. Cumple con la ley y protege tu vehículo ante daños a terceros."
          call="Obtén tu seguro RCV obligatorio al instante. Protege tu vehículo y cumple con la ley con cobertura ante daños a terceros."
          img={rcv}
        />
      </div>
    </section>
  );
};

export default Services;
