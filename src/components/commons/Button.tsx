import { Link } from "react-router-dom";

type ButtonProps = {
  text: string;
  link?: string;
  color?: string;
  margin?: string;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
};

const Button = ({
  text,
  link = "#",
  color = "#35AE74",
  margin,
  onClick,
  className,
  loading = false,
  loadingText,
  disabled = false,
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  const contentText = loading && loadingText ? loadingText : text;
  const baseClasses =
    className ||
    "flex items-center justify-center text-white font-semibold text-base px-6 h-12 rounded-xl transition";
  const disabledClasses = isDisabled
    ? " opacity-70 cursor-not-allowed pointer-events-none"
    : " hover:opacity-90";

  return (
    <Link
      to={link}
      style={{ backgroundColor: color, margin }}
      onClick={isDisabled ? undefined : onClick}
      className={`${baseClasses}${disabledClasses}`}
      aria-busy={loading}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
        )}
        {contentText}
      </span>
    </Link>
  );
};

export default Button;
