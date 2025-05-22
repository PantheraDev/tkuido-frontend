type ButtonProps = {
  text: string;
  color?: string;
  margin?: string;
};

const Button = ({ text, color = "#35AE74", margin }: ButtonProps) => {
  return (
    <button
      style={{ backgroundColor: color, margin }}
      className="text-white font-semibold text-base px-6 h-12 rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
    >
      {text}
    </button>
  );
};

export default Button;
