import { BookHeart, LogOut, User, Users, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../commons/Logo";
import { useAuth } from "../../hook/useAuthActions";

const SidenavMenu = () => {
  const { logout } = useAuth();

  return (
    <aside className="h-full bg-white rounded-xl shadow-sm flex justify-between ">
      {/* Logo */}
      <div className="flex">
        <Logo className="p-4 justify-center" />
        <div className="h-[85%] w-[1.5px] my-auto rounded bg-gray-200"></div>
      </div>
      {/* Navegación */}
      <nav className="my-auto text-sm font-medium text-gray-700 resp-p ">
        <div className="flex gap-15">
          {sections.map((section) =>
            section.to ? (
              <Link
                key={section.label}
                to={section.to}
                className="flex flex-col w-24 items-center gap-1 p-2 rounded hover:bg-[#2B7A57] hover:text-[#FFFFFF] transition"
              >
                <section.icon />
                {section.label}
              </Link>
            ) : (
              // Sección aún sin página propia: se muestra deshabilitada en
              // vez de enlazar a una ruta que no existe.
              <span
                key={section.label}
                aria-disabled="true"
                title="Próximamente"
                className="flex flex-col w-24 items-center gap-1 p-2 rounded text-gray-400 cursor-not-allowed"
              >
                <section.icon />
                {section.label}
              </span>
            ),
          )}
        </div>
      </nav>

      {/* Cerrar sesión abajo */}
      <div className="flex">
        <div className="h-[85%] w-[1.5px] my-auto rounded bg-gray-200"></div>
        <div className="px-4 pb-6 mt-auto resp-p">
          <button
            type="button"
            className="flex items-center gap-3 p-2 text-red-600 hover:bg-red-50 rounded transition"
            onClick={logout}
          >
            <LogOut />
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SidenavMenu;

type NavSection = { label: string; to: string | null; icon: LucideIcon };

const sections: NavSection[] = [
  { label: "Perfil", to: "/perfil", icon: User },
  { label: "Familia", to: null, icon: Users },
  { label: "Plan", to: null, icon: BookHeart },
];
