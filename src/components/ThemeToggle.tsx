import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Uključi svetlu temu" : "Uključi tamnu temu"}
      title={isDark ? "Svetla tema" : "Tamna tema"}
      className="flex items-center justify-center rounded-full border border-brand-border bg-brand-surface p-2.5 text-brand-dim transition-colors hover:border-brand-border-strong hover:text-brand-heading"
    >
      {isDark ? (
        <Sun className="h-4 w-4 shrink-0" />
      ) : (
        <Moon className="h-4 w-4 shrink-0" />
      )}
    </button>
  );
}
