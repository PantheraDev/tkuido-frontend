const SidenavMenu = () => {
  return (
    <aside className="h-full bg-white rounded-xl shadow-sm flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center h-20">
        <span className="text-[#2B7A57] font-bold text-2xl">TKUIDO</span>
      </div>
      <div className="w-[90%] h-[1.5px] rounded bg-gray-200 mx-auto"></div>

      {/* Navegación */}
      <nav className="flex-1 px-4 py-6 text-sm font-medium text-gray-700">
        <div className="space-y-2">
          {sections.map((section) => (
            <a
              key={section}
              href={`/${section.toLowerCase().replace(" ", "-")}`}
              className="flex items-center gap-3 p-2 rounded hover:bg-[#F0FDF4] hover:text-[#2B7A57] transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor">
                <use
                  href={`#icon-${section.toLowerCase().replace(" ", "-")}`}
                />
              </svg>
              {section}
            </a>
          ))}
        </div>
      </nav>

      {/* Cerrar sesión abajo */}
      <div className="px-4 pb-6 mt-auto">
        <a
          href="/logout"
          className="flex items-center gap-3 p-2 text-red-600 hover:bg-red-50 rounded transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor">
            <use href="#icon-logout" />
          </svg>
          Cerrar sesión
        </a>
      </div>
    </aside>
  );
};

export default SidenavMenu;

const sections = ["Mi Perfil", "Beneficiarios", "Mi Plan"];
