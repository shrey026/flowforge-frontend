"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "flowforge-theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const themeListeners = new Set<() => void>();

function subscribe(callback: () => void) {
  themeListeners.add(callback);
  return () => themeListeners.delete(callback);
}

// Read the class the inline script (in the root layout) already applied to
// <html> before hydration.
function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

// Light mode is the default on the server, since there's no DOM to read
// from. useSyncExternalStore is built to reconcile this against the real
// client value without triggering a hydration mismatch warning.
function getServerSnapshot(): Theme {
  return "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage may be unavailable (e.g. private browsing); theme still
    // works for the current session via the class on <html>.
  }
  themeListeners.forEach((listener) => listener());
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setTheme = useCallback((next: Theme) => applyTheme(next), []);
  const toggleTheme = useCallback(
    () => applyTheme(theme === "dark" ? "light" : "dark"),
    [theme]
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
