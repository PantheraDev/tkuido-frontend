import { Link } from "react-router-dom";
import mail from "../../assets/email_icon.png";
import lock from "../../assets/lock_icon.png";
import Button from "../commons/Button";

const FormLogin = () => {
  return (
    <>
      {/* Left: Login Form */}
      <div className="w-full lg:w-1/2 p-5 xl:p-25 lg:px-10 md:px-25 h-fit">
        <div className="mb-8 ">
          <div className="flex gap-5 items-center">
            <span className="text-[#2B7A57] font-bold text-3xl">
              <Link to={"/tkuido-frontend"}>TKUIDO</Link>
            </span>
            {/* <img src="/logo.svg" alt="TKUIDO Logo" className="w-20 mb-4" /> */}
          </div>
          <h2 className="resp-h2 mb-6">Iniciar sesión</h2>

          <form className="space-y-5">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <img
                  src={mail}
                  alt="Email icono"
                  className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                />
                <input
                  type="email"
                  className="resp-p pl-10 pr-4 py-2 w-full bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="ejemplo@gmail.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <div className="relative">
                <img
                  src={lock}
                  alt="Password icono"
                  className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="resp-p pl-10 pr-4 py-2 w-full bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input type="checkbox" />
                <span className="text-sm">Recuerdame</span>
              </label>
              <a href="#" className="text-sm text-[#35AE74] hover:underline">
                Olvidaste tu contraseña?
              </a>
            </div>
            <div className="flex flex-col">
              <Button text="Iniciar Sesión" color="#2B7A57" />
            </div>
          </form>

          <div className="mt-4 text-sm">
            No estas registrado?{" "}
            <Link
              to={"/registro"}
              className="text-[#35AE74] font-medium hover:underline"
            >
              Registrate aquí
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
