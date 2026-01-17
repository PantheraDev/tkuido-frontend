import Plan from "../commons/Plan";

const PlainsAndPrices = () => {
  return (
    <section className="py-16 bg-white text-gray-800">
      <div className="text-center mb-12">
        <h2 className="resp-h2 mb-2">Planes y Precios</h2>
        <p className="resp-p">
          Elige el plan que se adapte a ti o a tu familia
        </p>
      </div>

      <div className="grid grid-cols-1 max-w-5xl mx-auto px-10 gap-5 justify-items-center lg:grid-cols-3 lg:gap-15">
        {plans.map((plan, index) => (
          <Plan
            key={index}
            titulo={plan.titulo}
            precio={plan.precio}
            descripcion={plan.descripcion}
            destacado={plan.destacado}
            detalles={plan.detalles}
          />
        ))}
      </div>
    </section>
  );
};

export default PlainsAndPrices;

const plans = [
  {
    titulo: "Telemedicina",
    precio: 3,
    destacado: false,
    descripcion: "Fúnebres",
    detalles: [
      "Acceso a récipe e informe médico digital",
      "Seguimiento y acompañamiento post asistencia",
      "Atención sanitaria primaria prestada a distancia"
    ],
  },
  {
    titulo: "Plan Premium",
    precio: 16,
    destacado: true,
    descripcion: "Paquetes",
    detalles: [
      "Servicio de telemedicina 24 horas / 364 días al año",
      "Especialidad pediatrica",
      "Medicina general",
    ],
  },
  {
    titulo: "Plan Oro",
    precio: 3.25,
    destacado: false,
    descripcion: "Fúnebres",
    detalles: [
      "Velatorio en capilla",
      "Cremación",
      "Ataúd Standard"
    ],
  },
];
