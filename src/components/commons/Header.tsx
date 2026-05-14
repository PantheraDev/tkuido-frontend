import { useState } from "react";
import Button from "../commons/Button";
import Logo from "./Logo";
import { useAuth } from "../../hook/useAuthActions";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const getSectionHref = (id: string) => `${import.meta.env.BASE_URL}#${id}`;

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between max-w-7xl mx-auto px-6 py-5 gap-4">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-gray-700 font-medium">
          {menu.map((item) => (
            <a
              key={item.id}
              href={getSectionHref(item.id)}
              className="py-2 hover:text-[#35AE74] hover:border-b-2 border-[#2B7A57] transition"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex gap-2">
          {!user ? (
            <>
              <Button text="Iniciar Sesión" link="/login" color="#2B7A57" />
              <Button text="Regístrate" link="/registro" />
            </>
          ) : (
            <>
              <Button text="Perfil" link="/perfil" color="#2B7A57" />
              <Button
                text="Cerrar sesión"
                onClick={logout}
                color=""
                className="flex items-center gap-3 p-2 text-red-600 hover:bg-red-50 rounded transition"
              />
            </>
          )}
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
          {menu.map((item) => (
            <a
              key={item.id}
              href={getSectionHref(item.id)}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-gray-700 hover:text-[#2B7A57] border-b"
            >
              {item.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            {!user ? (
              <>
                <Button text="Iniciar Sesión" link="/login" color="#2B7A57" />
                <Button text="Regístrate" link="/registro" />
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Button text="Perfil" link="/perfil" color="#2B7A57" />
                <Button
                  text="Cerrar sesión"
                  onClick={logout}
                  color=""
                  className="flex items-center gap-3 p-2 text-red-600 hover:bg-red-50 rounded transition text-center"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

const menu = [
  { label: "Servicios", id: "services" },
  { label: "Planes", id: "planes" },
  { label: "Sobre Nosotros", id: "sobre-nosotros" },
  { label: "Preguntas Frecuentes", id: "preguntas-frecuentes" },
  { label: "Contacto", id: "contacto" },
];
