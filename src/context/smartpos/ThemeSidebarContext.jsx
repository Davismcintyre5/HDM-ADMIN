import { createContext, useContext, useState, useEffect } from 'react';

const ThemeSidebarContext = createContext(null);

export function ThemeSidebarProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('smartpos_theme') === 'dark' ||
        (!localStorage.getItem('smartpos_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('smartpos_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('smartpos_theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const toggleMobileSidebar = () => setMobileSidebarOpen(prev => !prev);

  return (
    <ThemeSidebarContext.Provider value={{
      darkMode, toggleTheme,
      sidebarOpen, toggleSidebar,
      mobileSidebarOpen, toggleMobileSidebar, setMobileSidebarOpen,
    }}>
      {children}
    </ThemeSidebarContext.Provider>
  );
}

export function useThemeSidebar() {
  const context = useContext(ThemeSidebarContext);
  if (!context) throw new Error('useThemeSidebar must be used within ThemeSidebarProvider');
  return context;
}