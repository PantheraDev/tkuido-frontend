import { Link } from "react-router-dom";

type ButtonProps = {
  text: string;
  link?: string;
  color?: string;
  margin?: string;
};

const Button = ({
  text,
  link = "#",
  color = "#35AE74",
  margin,
}: ButtonProps) => {
  return (
    <Link
      to={link}
      style={{ backgroundColor: color, margin }}
      className="flex items-center justify-center text-white font-semibold text-base px-6 h-12 rounded-xl hover:opacity-90 transition"
    >
      {text}
    </Link>
  );
};

export default Button;
