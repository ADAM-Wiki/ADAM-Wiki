import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

/**
 * Renders the same markup in both themes on purpose.
 *
 * Pages are prerendered in the dark theme and then hydrated. If this button
 * picked its icon from React state, a visitor on the light theme would hydrate
 * a Moon over a prerendered Sun - a structural mismatch that makes React throw
 * away the server markup. Both icons are always present and CSS picks one, so
 * the tree React hydrates is identical to the tree it prerendered.
 */
export default function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Promeni temu"
      title="Promeni temu"
      className="flex items-center justify-center rounded-full border border-brand-border bg-brand-surface p-2.5 text-brand-dim transition-colors hover:border-brand-border-strong hover:text-brand-heading"
    >
      <Sun aria-hidden className="theme-icon-dark h-4 w-4 shrink-0" />
      <Moon aria-hidden className="theme-icon-light h-4 w-4 shrink-0" />
    </button>
  );
}
