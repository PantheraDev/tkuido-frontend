import Button from "../commons/Button";
import InputForm from "../commons/InputForm";
import mail from "../../assets/email_icon.png";
import lock from "../../assets/lock_icon.png";
import phone from "../../assets/phone_icon.png";
import id from "../../assets/id_icon.png";
import name from "../../assets/name_icon.png";
import calendar from "../../assets/calendar_icon.png";
import ticket from "../../assets/ticket_icon.png";
import { Link } from "react-router-dom";

const FormSignUp = () => {
  return (
    <div className="w-full lg:w-1/2 p-5 xl:px-25 lg:px-10 md:px-25 h-fit">
      <div className="">
        <span className="text-[#2B7A57] font-bold text-3xl">
          <Link to={"/tkuido-frontend"}>TKUIDO</Link>
        </span>
        {/* <img src="/logo.svg" alt="TKUIDO Logo" className="w-20 mb-4" /> */}
        <h2 className="resp-h2 mb-6">Registrate</h2>

        <form className=" grid grid-cols-2 gap-4">
          <div>
            <InputForm
              title="Nombre"
              placeholder="Ingresa tu nombre"
              img={name}
              required
            />
          </div>
          <div>
            <InputForm
              title="Apellido"
              placeholder="Ingresa tu apellido"
              img={name}
              required
            />
          </div>
          <div>
            <InputForm
              title="Teléfono"
              placeholder="Ingresa tu teléfono"
              type="tel"
              img={phone}
              required
            />
          </div>
          <div>
            <InputForm
              title="Cédula"
              placeholder="Ingresa tu cédula"
              type="text"
              img={id}
              required
            />
          </div>
          <div className="col-[1/3]">
            <InputForm
              title="Fecha de nacimiento"
              placeholder="Ingresa tu fecha de nacimiento"
              type="date"
              img={calendar}
              required
            />
          </div>
          <div className="col-[1/3]">
            <InputForm
              title="Correo Electrónico"
              placeholder="Ingresa tu correo electrónico"
              type="email"
              img={mail}
              required
            />
          </div>
          <div className="col-[1/3]">
            <InputForm
              title="Confirmacion del Correo Electrónico"
              placeholder="Ingresa tu correo electrónico nuevamente"
              type="email"
              img={mail}
              required
            />
          </div>
          <div className="col-[1/3]">
            <InputForm
              title="Contraseña"
              placeholder="Ingresa tu contraseña"
              type="password"
              img={lock}
              required
            />
          </div>
          <div className="col-[1/3]">
            <InputForm
              title="Codigo de referido"
              placeholder="Ingresa el codigo de referido"
              type="text"
              img={ticket}
              required={false}
            />
          </div>

          <div className="flex flex-col col-[1/3]">
            <Button text="Registrarse" color="#2B7A57" />
          </div>
        </form>

        <div className="mt-4 text-sm text-center lg:text-left">
          Ya estas registrado?{" "}
          <Link
            to={"/login"}
            className="text-[#35AE74] font-medium hover:underline"
          >
            Ingresa aquí
          </Link>
        </div>

        {/* <div className="flex space-x-4 mt-6 justify-center">
            <button className="p-3 bg-white border rounded-full shadow"></button>
            <button className="p-3 bg-white border rounded-full shadow"></button>
            <button className="p-3 bg-white border rounded-full shadow"></button>
          </div> */}
      </div>
    </div>
  );
};

export default FormSignUp;
