interface ButtonProps {
  title: string;
  variant?: "small" | "large";
  onClick?: () => void;
  className?: string;
}

const Button = ({
  title,
  variant = "small",
  onClick,
  className = "",
}: ButtonProps) => {
  const variantClasses = variant === "small" ? "py-2 px-4" : "py-2.5 px-5";

  return (
    <button
      onClick={onClick}
      className={`border-none font-medium rounded-full cursor-pointer flex items-center ${variantClasses} ${className} `}
    >
      {variant === "small" ? (
        <p className="m-0">{title}</p>
      ) : (
        <h6 className="m-0">{title}</h6>
      )}
    </button>
  );
};

export default Button;
