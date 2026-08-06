import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type BackButtonProps = {
  fallbackPath?: string;
  className?: string;
};

export function BackButton({ fallbackPath = "/", className = "" }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors duration-150 cursor-pointer ${className}`}
      aria-label="Go back to previous page"
    >
      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      <span className="hidden sm:inline">Back</span>
    </button>
  );
}