import hero from "../../assets/Hero.png";
import shield from "../../assets/shield.svg";
import Button from "../commons/Button";

const Hero = () => {
  return (
    <section className="h-dvh grid container text-center mx-auto my-10 px-5 md:my-15 md:h-auto md:text-left">
      <div className="flex mx-auto size-fit border-1 border-[#35AE74] rounded-full px-3 py-1.5 md:mx-0 md:col-[1/2] md:row-[1/2] md:self-end ">
        <img className="w-5 h-5 mr-1" src={shield} alt="Escudo de garantia" />
        <p className="text-sm">
          <span className="text-[#35AE74] font-semibold">100%</span> Salud y
          atención garantizada
        </p>
      </div>
      <div className="md:mr-[50px] md:col-[1/2] md:row-[2/3]">
        <h1 className=" resp-h1 font-medium">
          Cuidamos de tu salud y protegemos a tu familia, estés donde estés
        </h1>
        <p className="resp-p mt-8">
          En <span className="text-[#35AE74] font-semibold">TKUIDO</span> te
          ofrecemos el mejor servicio de telemedicina las 24 horas y un plan
          funerario integral que asegura tranquilidad en los momentos más
          difíciles. Todo en un solo lugar, fácil y accesible para ti.
        </p>
        <div className="flex flex-col gap-2 mt-5 md:flex-row md:mx-0 md:mt-8">
          <Button text="Conocer servicios" />
          <Button text="Ver planes" color="#2B7A57" />
        </div>
      </div>
      <img
        className="row-[2/3] md:col-[2/3] md:row-[1/3] md:self-center md:mx-auto md:h-full object-cover "
        src={hero}
        alt="Hero Image"
      />
    </section>
  );
};

export default Hero;
