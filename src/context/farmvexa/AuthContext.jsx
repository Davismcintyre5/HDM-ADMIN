import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, setAuthToken, setupInterceptors } from '../../services/farmvexa';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('farmvexa_admin')); } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('farmvexa_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) setAuthToken(token);
    setupInterceptors(() => {
      localStorage.removeItem('farmvexa_token');
      localStorage.removeItem('farmvexa_refresh_token');
      localStorage.removeItem('farmvexa_admin');
      setToken(null); setAdmin(null);
      window.location.href = '/farmvexa/login';
    });
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    const d = data.data || data;
    localStorage.setItem('farmvexa_token', d.token);
    localStorage.setItem('farmvexa_refresh_token', d.refreshToken);
    localStorage.setItem('farmvexa_admin', JSON.stringify(d.admin || d));
    setAuthToken(d.token);
    setToken(d.token);
    setAdmin(d.admin || d);
  };

  const logout = () => {
    localStorage.removeItem('farmvexa_token');
    localStorage.removeItem('farmvexa_refresh_token');
    localStorage.removeItem('farmvexa_admin');
    setToken(null); setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}