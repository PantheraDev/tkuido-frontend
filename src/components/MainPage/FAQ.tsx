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
    question: "¿Qué tipos de protección ofrecen los planes de protección de TKUIDO?",
    answer:
      "Los microseguros son pólizas de seguro diseñadas específicamente para personas con recursos limitados. Son productos sencillos y asequibles que cubren riesgos básicos, como: ● Salud: Accidentes, Gastos médicos menores, hospitalización, maternidad. ● Funeraria: costo de los gastos de velación, cremación y entierro. ● Vida: Fallecimiento, invalidez. ● Propiedad: Pérdida o daño de bienes como vehículos, motos, locales, viviendas, y más. ● Desastres naturales: Terremotos, inundaciones, incendios y otros..",
  },
  {
    question: "¿Por qué es importante estar Protegido por los microseguros de TKUIDO?",
    answer:
      "●Protección Financiera: Permite a las personas protegerse ante eventos inesperados que podrían debilitar nuestra situación financiera y sumirnos en la pobreza. ●Reducción de la vulnerabilidad: Ayudan a las familias a hacer frente a pérdidas económicas y a mantener su estabilidad financiera y emocional. ●Fomento del desarrollo: Al reducir los riesgos, los microseguros pueden impulsar el desarrollo económico y social de las familias y sus comunidades.",
  },
  {
    question: "¿Cuáles son las principales características de los planes de Protección de TKuido?",
    answer:
      "●Productos Premium: Los productos de protección personal y familiar de TKuido son de primera calidad. Provistos por empresas con probada reputación y experiencia en cada ramo de protección. ●Bajos Costos (Primas bajas): Las primas suelen ser muy bajas y pueden pagarse en pequeñas cuotas. ●Distribución a través de redes existentes: Se distribuyen a través de nuestras aplicaciones Web y móvil, así como de nuestros agentes identificados y otras redes existentes. ●Productos sencillos: Los productos son fáciles de entender y se adaptan a las necesidades de la población.",
  },
  {
    question: "¿Por qué comprar los productos de TKuido?",
    answer:
      "Los productos de TKuido están diseñados para proteger a las personas de los riesgos de la vida diaria, reduciendo su vulnerabilidad y permitiendo su compra por parte de las poblaciones más desfavorecidas y de menor poder adquisitivo. Buscamos promover el desarrollo económico y social de nuestros clientes.",
  },
  {
    question: "¿Cuáles son los beneficios de los productos de TKuido?",
    answer:
      "●Protección Personal / Familiar (financiera): Ayudan a las personas a hacer frente a imprevistos y a evitar caer en la pobreza. ●Mayor tranquilidad: Brinda seguridad y tranquilidad al saber que están protegidos ante posibles riesgos. ●Fomento del emprendimiento: Permite a las personas emprender y desarrollar sus negocios con mayor confianza. ●Inclusión financiera: Contribuye a la inclusión financiera de las poblaciones más vulnerables.",
  }
];
