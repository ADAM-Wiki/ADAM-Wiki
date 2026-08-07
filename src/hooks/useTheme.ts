import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "adam-theme";

function readStoredTheme(): Theme {
  if (typeof document === "undefined") return "dark";

  // The inline script in index.html has already resolved and applied the theme
  // before first paint; trust the attribute it set.
  const applied = document.documentElement.getAttribute("data-theme");
  return applied === "light" ? "light" : "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  // Another tab changing the preference should be reflected here too.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next: Theme = event.newValue === "light" ? "light" : "dark";
      setTheme(next);
      document.documentElement.setAttribute("data-theme", next);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const applyTheme = useCallback((next: Theme) => {
    const root = document.documentElement;

    // Suppress per-element transitions for one frame so the swap is instant
    // rather than a staggered colour crossfade.
    root.classList.add("theme-switching");
    root.setAttribute("data-theme", next);
    root.style.colorScheme = next;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage: the theme still applies for this page.
    }

    window.requestAnimationFrame(() => {
      root.classList.remove("theme-switching");
    });

    setTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === "dark" ? "light" : "dark");
  }, [applyTheme, theme]);

  return { theme, toggleTheme, applyTheme };
}
