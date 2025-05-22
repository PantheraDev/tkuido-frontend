import FAQCard from "../commons/FAQCard";

const FAQ = () => {
  return (
    <section className="container mx-auto py-10  text-gray-800 lg:py-16" id="faq">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-12 items-start ">
        <div className="lg:col-[2/3]">
          <span className="text-sm uppercase text-[#2B7A57] font-semibold">
            Preguntas frecuentes
          </span>
          <h2 className="resp-h2 mb-4">
            ¿Aún tienes dudas sobre nuestros servicios?
          </h2>
          <p className="resp-p text-gray-600">
            Aquí respondemos las preguntas más comunes sobre la telemedicina y
            los servicios funerarios de TKUIDO.
          </p>
        </div>

        <div className="space-y-4 lg:col-[1/2] lg:row-[1/2]" id="faq-accordion">
          {data.map((item, index) => (
            <FAQCard
              key={index}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

const data = [
  {
    question: "¿Qué es TKUIDO y qué servicios ofrece?",
    answer:
      "TKUIDO es una plataforma de salud que ofrece telemedicina 24/7 y un servicio funerario nacional integral para ti y tu familia.",
  },
  {
    question: "¿Cómo funciona la consulta médica en línea?",
    answer:
      "Solo inicia sesión, elige el servicio médico y serás atendido por un profesional en tiempo real desde tu dispositivo.",
  },
  {
    question: "¿Qué incluye el servicio funerario?",
    answer:
      "Incluye traslado, velorio, cremación o inhumación, apoyo documental y acompañamiento emocional para la familia.",
  },
  {
    question: "¿Puedo registrar a otros miembros de mi familia?",
    answer:
      "Sí, puedes añadir beneficiarios según el plan contratado para que accedan tanto a los servicios médicos como funerarios.",
  },
  {
    question: "¿Cómo puedo pagar el servicio?",
    answer:
      "Puedes pagar con tarjeta, transferencia, Zelle o Pago Móvil. También ofrecemos suscripción automática mensual.",
  },
  {
    question:
      "¿Qué pasa si necesito atención médica urgente fuera del horario?",
    answer:
      "No hay problema. Nuestro servicio de telemedicina está disponible 24/7, incluso fines de semana y días feriados.",
  },
];
