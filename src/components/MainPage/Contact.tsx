import ContactLinks from "../commons/ContactLinks";

const Contact = () => {
  return (
    <section className="py-10  px-4 md:px-12 lg:py-15 lg:pb-20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="resp-h2 text-gray-900 mb-6">Aun tienes preguntas?</h2>
        <p className="resp-p text-gray-600 mb-6">
          ¿Tienes preguntas o necesitas ayuda? Estamos aquí para ti.
        </p>
        <ContactLinks />
      </div>
    </section>
  );
};

export default Contact;
