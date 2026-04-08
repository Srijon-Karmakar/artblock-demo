import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "dark" | "amoled" | "light";

const STORAGE_KEY = "artblock-theme";
const DEFAULT: Theme = "dark";

type ThemeCtx = { theme: Theme; setTheme: (t: Theme) => void };

const Context = createContext<ThemeCtx>({ theme: DEFAULT, setTheme: () => undefined });

export const useTheme = () => useContext(Context);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    let resolved: Theme = DEFAULT;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "amoled" || stored === "light") {
        resolved = stored;
      }
    } catch { /* ignore */ }
    // Apply synchronously on first render to avoid flash
    document.documentElement.setAttribute("data-theme", resolved);
    return resolved;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  return (
    <Context.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </Context.Provider>
  );
};
