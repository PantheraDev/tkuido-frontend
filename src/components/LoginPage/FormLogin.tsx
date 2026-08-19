import { Link } from "react-router-dom";
import mail from "../../assets/email_icon.png";
import lock from "../../assets/lock_icon.png";
/*import Button from "../commons/Button";*/
import { useState } from "react";
import { useAuthActions } from "../../hook/useAuthActions";
import { useLocation, useNavigate } from "react-router-dom";

const FormLogin = () => {
  const { login, loading, error } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | { notice?: string; from?: { pathname: string } }
    | null;
  const notice = state?.notice;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      // Si venías de una ruta protegida (ej. "Contratar" un plan sin sesión),
      // ProtectedRoute guarda esa ruta en location.state.from; volvemos ahí
      // en vez de mandar siempre a /perfil.
      const from = state?.from?.pathname ?? "/perfil";
      navigate(from, { replace: true });
    }
  };

  return (
    <>
      {/* Left: Login Form */}
      <div className="w-full lg:w-1/2 p-5 xl:p-25 lg:px-10 md:px-25 h-fit">
        <div className="mb-8 ">
          <div className="flex gap-5 items-center">
            <span className="text-[#2B7A57] font-bold text-3xl">
              <Link to={"/"}>TKUIDO</Link>
            </span>
            {/* <img src="/logo.svg" alt="TKUIDO Logo" className="w-20 mb-4" /> */}
          </div>
          <h2 className="resp-h2 mb-6">Iniciar Sesión</h2>

          {notice && (
            <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              {notice}
            </p>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="login-email"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="relative">
                <img
                  src={mail}
                  alt=""
                  aria-hidden="true"
                  className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                />
                <input
                  id="login-email"
                  type="email"
                  className="resp-p pl-10 pr-4 py-2 w-full bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="ejemplo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm mb-1">
                Password
              </label>
              <div className="relative">
                <img
                  src={lock}
                  alt=""
                  aria-hidden="true"
                  className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                />
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  className="resp-p pl-10 pr-4 py-2 w-full bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input type="checkbox" />
                <span className="text-sm">Recuerdame</span>
              </label>
              <Link
                to="/recuperar"
                className="text-sm text-[#35AE74] hover:underline"
              >
                Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="flex flex-col">
              {/*<Button link="/perfil" text="Iniciar Sesión" color="#2B7A57" /> */}
              <button
                type="submit"
                disabled={loading}
                className="resp-btn bg-[#2B7A57] text-white py-2 rounded-lg hover:bg-green-700 transition duration-300"
              >
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </button>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          </form>

          <div className="mt-4 text-sm">
            No estas registrado?{" "}
            <Link
              to={"/registro"}
              className="text-[#35AE74] font-medium hover:underline"
            >
              Regístrate aquí
            </Link>
          </div>

          {/* <div className="flex space-x-4 mt-6 justify-center">
            <button className="p-3 bg-white border rounded-full shadow"></button>
            <button className="p-3 bg-white border rounded-full shadow"></button>
            <button className="p-3 bg-white border rounded-full shadow"></button>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default FormLogin;
