import { Link } from "react-router-dom";

type ButtonProps = {
  text: string;
  link?: string;
  color?: string;
  margin?: string;
  onClick?: () => void;
  state?: unknown;
  className?: string;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  title?: string;
};

const Button = ({
  text,
  link,
  color = "#35AE74",
  margin,
  onClick,
  state,
  className,
  loading = false,
  loadingText,
  disabled = false,
  title,
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  const contentText = loading && loadingText ? loadingText : text;
  const baseClasses =
    className ||
    "flex items-center justify-center text-white font-semibold text-base px-6 h-12 rounded-xl transition";
  const disabledClasses = isDisabled
    ? " opacity-70 cursor-not-allowed pointer-events-none"
    : " hover:opacity-90";

  const content = (
    <span className="inline-flex items-center justify-center gap-2">
      {loading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
      )}
      {contentText}
    </span>
  );

  // Sin `link`: es una acción pura (ej. logout, editar), no una navegación.
  // Renderizamos un <button> real para que lectores de pantalla y teclado
  // lo traten como acción, no como enlace roto a "#".
  if (!link) {
    return (
      <button
        type="button"
        style={{ backgroundColor: color, margin }}
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        className={`${baseClasses}${disabledClasses}`}
        aria-busy={loading}
        title={title}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={link}
      state={state}
      style={{ backgroundColor: color, margin }}
      onClick={isDisabled ? undefined : onClick}
      className={`${baseClasses}${disabledClasses}`}
      aria-busy={loading}
      title={title}
    >
      {content}
    </Link>
  );
};

export default Button;
