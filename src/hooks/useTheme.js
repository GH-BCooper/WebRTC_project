import { useCallback, useEffect, useState } from "react";

// Theme Hook
// Global dark/light theme, stored in localStorage and applied to <html>.
function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    [],
  );

  return { theme, toggle };
}

// Export Hook
export default useTheme;
