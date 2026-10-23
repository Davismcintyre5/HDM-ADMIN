import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

const ThemeSidebarContext = createContext(null);

const THEME_KEY = 'meteo_theme';
const SIDEBAR_KEY = 'meteo_sidebar_open';

const prefersDark = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export function SidebarProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return prefersDark();
  });

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored === null) return true;
    return stored === 'true';
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(sidebarOpen));
  }, [sidebarOpen]);

  const toggleTheme = useCallback(() => setDarkMode((v) => !v), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const toggleMobileSidebar = useCallback(
    () => setMobileSidebarOpen((v) => !v),
    []
  );

  return (
    <ThemeSidebarContext.Provider
      value={{
        darkMode,
        toggleTheme,
        setDarkMode,
        sidebarOpen,
        toggleSidebar,
        setSidebarOpen,
        mobileSidebarOpen,
        toggleMobileSidebar,
        setMobileSidebarOpen,
      }}
    >
      {children}
    </ThemeSidebarContext.Provider>
  );
}

export function useThemeSidebar() {
  const ctx = useContext(ThemeSidebarContext);
  if (!ctx)
    throw new Error('useThemeSidebar must be used within SidebarProvider');
  return ctx;
}

export const useSidebar = useThemeSidebar;

export default ThemeSidebarContext;