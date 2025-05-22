import ContactLinks from "../commons/ContactLinks";

const Footer = () => {
  return (
    <footer className="bg-[#2B7A57] text-white py-10 px-4 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 lg:justify-items-center">
        <div>
          <h3 className="resp-h3 mb-5 text-center">TKUIDO</h3>
          <p className="resp-p text-green-100">
            Soluciones humanas y accesibles para la salud y el descanso final.
          </p>
        </div>
        <div>
          <h4 className="resp-h4 mb-5 text-center">Navegación</h4>
          <ul className="space-y-2 text-sm">
            {menu.map((item, index) => (
              <li key={index}>
                <a href="#" className="hover:underline">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="resp-h4 mb-5 text-center">Contacto</h4>
          <ContactLinks />
        </div>
      </div>
      <div className="text-center text-xs text-green-300 mt-10">
        © {new Date().getFullYear()} TKUIDO. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;

const menu = [
  "Servicios",
  "Planes",
  "Sobre Nosotros",
  "Preguntas Frecuentes",
  "Contacto",
];
