import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../commons/Button";
import logo from "../../assets/Logo.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const font = "Avenir Black";

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between max-w-7xl mx-auto px-6 py-5 gap-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img src={logo} alt="TKUIDO Logo" className="h-15"/>
          <div className="flex flex-col">
            <span className="text-[#2B7A57] font-bold text-3xl" style={{ fontFamily: font }}>TKUIDO</span>
            <span className=" text-gray-600 font-bold text-sm text-right" style={{ fontFamily: font }}>Contigo y por ti</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-gray-700 font-medium">
          {menu.map((item, index) => (
            <a
              key={index}
              href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
              className="py-2 hover:text-[#35AE74] hover:border-b-2 border-[#2B7A57] transition"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex gap-2">
          <Button text="Iniciar Sesión" link="/login" color="#2B7A57" />
          <Button text="Regístrate" link="/registro" />
        </div>

        {/* Mobile menu toggle */}
        <div className="lg:hidden ml-auto">
          <button
            onClick={toggleMenu}
            className="text-gray-600 text-2xl focus:outline-none"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu with transition */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out lg:hidden px-6 ${
          mobileMenuOpen ? "max-h-[500px] py-4" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-2">
          {menu.map((item, index) => (
            <a
              key={index}
              href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
              className="py-2 text-gray-700 hover:text-[#2B7A57] border-b"
            >
              {item}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Button text="Iniciar sesión" color="#2B7A57" />
            <Button text="Regístrate" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

const menu = [
  "Servicios",
  "Planes",
  "Sobre Nosotros",
  "Preguntas Frecuentes",
  "Contacto",
];
