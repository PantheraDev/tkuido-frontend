import Button from "./Button";
import check from "../../assets/check.svg";

type PlanProps = {
  destacado?: boolean;
  titulo: string;
  precio: number;
  descripcion: string;
  detalles: string[];
};

const Plan = ({
  titulo,
  descripcion,
  precio,
  destacado,
  detalles,
}: PlanProps) => {
  return (
    <div
      className={
        !destacado
          ? "flex flex-col justify-betwee w-70 md:min-w-80 border border-[#2B7A57] rounded-xl p-6 shadow hover:scale-105 transition duration-300 "
          : "flex flex-col justify-between w-70 md:min-w-80 border-4 border-[#2B7A57] rounded-xl p-6 shadow-lg hover:scale-105 transition duration-300 bg-[#f0fdf4] relative"
      }
    >
      {destacado && (
        <span className="absolute top-0 right-0 bg-[#2B7A57] text-white text-xs font-bold px-3 py-1 rounded-bl">
          Popular
        </span>
      )}
      <div>
        <h3 className="resp-h3 text-center">{titulo}</h3>
        <p className="text-center text-2xl lg:text-4xl font-bold text-[#2B7A57]">
          ${precio}
          <span className="text-base font-medium text-gray-500">/mes</span>
        </p>
        <p className="text-center text-sm text-gray-500 mb-4">{descripcion}</p>
        <hr className="my-4 border-gray-300" />
      </div>

      <ul className="space-y-2 text-sm text-gray-700 mb-6">
        {detalles.map((detalle, index) => (
          <li key={index} className="flex items-center">
            <img
              src={check}
              alt="Check icon"
              className="max-w-5 max-h-5 mr-5"
            />
            {detalle}
          </li>
        ))}
      </ul>
      <div className="h-full flex flex-col justify-end">
        <Button text="Contratar" link="/payment" />
      </div>
    </div>
  );
};

export default Plan;
