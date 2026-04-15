import logo from "../../assets/Logo.png";
import { Link } from "react-router-dom";

const Logo = ({ className }: { className?: string }) => {
  const font = "Avenir Black";

  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img src={logo} alt="TKUIDO Logo" className="h-15" />
      <div className="flex flex-col">
        <span
          className="text-[#2B7A57] font-bold text-3xl"
          style={{ fontFamily: font }}
        >
          TKUIDO
        </span>
        <span
          className=" text-gray-600 font-bold text-sm text-right"
          style={{ fontFamily: font }}
        >
          Contigo y por ti
        </span>
      </div>
    </Link>
  );
};

export default Logo;
