type AdvantagesCardProps = {
  image: string;
  title: string;
  description: string;
  alt: string;
};
const AdvantagesCard = ({
  image,
  title,
  description,
  alt,
}: AdvantagesCardProps) => {
  return (
    <div className="flex flex-col gap-5 items-center justify-center ">
      <div className="flex items-center w-full">
        <div className="bg-[#2B7A57] rounded-full p-3 max-w-fit mr-5">
          <img src={image} alt={`Imagen ${alt}`} className="max-w-10" />
        </div>
        <h3 className="resp-h3">{title}</h3>
      </div>
      <p className="resp-p">{description}</p>
    </div>
  );
};

export default AdvantagesCard;
