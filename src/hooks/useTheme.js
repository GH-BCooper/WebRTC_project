import { useCallback, useEffect, useState } from "react";

// Theme Hook
// Global dark/light theme, stored in localStorage and applied to <html>.
// Also listens for "theme-change" events so other parts of the app (like the
// AI agent's set_theme tool) can flip the theme and keep this in sync.
function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const sync = (event) => {
      const next = event.detail || localStorage.getItem("theme");
      if (next === "dark" || next === "light") setTheme(next);
    };
    window.addEventListener("theme-change", sync);
    return () => window.removeEventListener("theme-change", sync);
  }, []);

  const toggle = useCallback(
    () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    [],
  );

  return { theme, toggle };
}

// Export Hook
export default useTheme;
