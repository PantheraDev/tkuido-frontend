import { Link } from "react-router-dom";

type ButtonProps = {
  text: string;
  link?: string;
  color?: string;
  margin?: string;
  onClick?: () => void;
  className?: string;
};

const Button = ({
  text,
  link = "#",
  color = "#35AE74",
  margin,
  onClick,
  className,
}: ButtonProps) => {
  return (
    <Link
      to={link}
      style={{ backgroundColor: color, margin }}
      onClick={onClick}
      className={`${className ? className : "flex items-center justify-center text-white font-semibold text-base px-6 h-12 rounded-xl hover:opacity-90 transition"}  `}
    >
      {text}
    </Link>
  );
};

export default Button;
