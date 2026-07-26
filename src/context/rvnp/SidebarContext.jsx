import { createContext, useContext, useState, useEffect } from 'react';

const ThemeSidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rvnp_theme') === 'dark' ||
        (!localStorage.getItem('rvnp_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rvnp_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rvnp_theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <ThemeSidebarContext.Provider value={{
      darkMode, toggleTheme, sidebarOpen, toggleSidebar,
      mobileSidebarOpen, setMobileSidebarOpen,
    }}>
      {children}
    </ThemeSidebarContext.Provider>
  );
}

export function useThemeSidebar() {
  const context = useContext(ThemeSidebarContext);
  if (!context) throw new Error('useThemeSidebar must be used within SidebarProvider');
  return context;
}
export { useThemeSidebar as useSidebar };