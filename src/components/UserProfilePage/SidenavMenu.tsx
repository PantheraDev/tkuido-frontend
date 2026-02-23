import { BookHeart, LogOut, User, Users } from "lucide-react";
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
          {sections.map((section) => (
            <a
              key={section}
              href={`/${section.toLowerCase().replace(" ", "-")}`}
              className="flex flex-col w-24 items-center gap-1 p-2 rounded hover:bg-[#2B7A57] hover:text-[#FFFFFF] transition"
            >
              {section === "Perfil" ? (
                <User />
              ) : section === "Familia" ? (
                <Users />
              ) : (
                <BookHeart />
              )}
              {section}
            </a>
          ))}
        </div>
      </nav>

      {/* Cerrar sesión abajo */}
      <div className="flex">
        <div className="h-[85%] w-[1.5px] my-auto rounded bg-gray-200"></div>
        <div className="px-4 pb-6 mt-auto resp-p">
          <a
            href="/tkuido-frontend/"
            className="flex items-center gap-3 p-2 text-red-600 hover:bg-red-50 rounded transition"
            onClick={logout}
          >
            <LogOut />
            Cerrar sesión
          </a>
        </div>
      </div>
    </aside>
  );
};

export default SidenavMenu;

const sections = ["Perfil", "Familia", "Plan"];
