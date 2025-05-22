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
    titulo: "Esencial",
    precio: 3,
    destacado: false,
    descripcion: "Usuarios individuales",
    detalles: [
      "Telemedicina 24/7",
      "Historia clínica digital",
      "1 beneficiario funerario",
      "Acceso desde app y web",
    ],
  },
  {
    titulo: "Familiar",
    precio: 6,
    destacado: true,
    descripcion: "Familias pequeñas (hasta 4 miembros)",
    detalles: [
      "Telemedicina ilimitada para todos",
      "Historia médica por miembro",
      "2 beneficiarios funerarios",
      "Atención prioritaria",
    ],
  },
  {
    titulo: "Total Plus",
    precio: 10,
    destacado: false,
    descripcion: "Familias completas o cobertura total",
    detalles: [
      "Telemedicina 24/7 + seguimiento",
      "Cobertura funeraria nacional completa",
      "Hasta 6 beneficiarios",
      "Asistencia personalizada 24/7",
      "Descuentos en servicios aliados",
    ],
  },
];
