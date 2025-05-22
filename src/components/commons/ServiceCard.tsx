import Button from "./Button";

type ServiceCardProps = {
  title: string;
  description: string;
  call: string;
  img: string;
};

const ServiceCard = ({ title, description, call, img }: ServiceCardProps) => {
  console.log("img", img);
  return (
    <div className="relative bg-[#2B7A57] rounded-2xl p-5 overflow-hidden shadow-lg transition transform hover:scale-105 hover:shadow-2xl md:p-10">
      <div className="flex flex-col items-start justify-between h-full gap-6">
        <div>
          <span className="text-xs uppercase text-white font-medium md:text-sm">
            {call}
          </span>

          <h3 className="resp-h3 text-white">{title}</h3>
          <p className="resp-p text-white mt-3">{description}</p>
        </div>
        <div className="w-full flex flex-col gap-0 md:flex-none md:w-auto">
          <Button text="Ver más" />
        </div>
        <img
          src={img}
          alt="Imagen aux"
          className="absolute bottom-1 right-1 lg:bottom-4 lg:right-4 w-80 opacity-20 md:opacity-30"
        />
      </div>
    </div>
  );
};

export default ServiceCard;
