import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, setAuthToken, setupInterceptors } from '../../services/nexguard';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexguard_admin')); } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('nexguard_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) setAuthToken(token);
    setupInterceptors(() => {
      localStorage.removeItem('nexguard_token');
      localStorage.removeItem('nexguard_refresh_token');
      localStorage.removeItem('nexguard_admin');
      setToken(null); setAdmin(null);
      window.location.href = '/nexguard/login';
    });
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    const d = data.data || data;
    localStorage.setItem('nexguard_token', d.accessToken);
    localStorage.setItem('nexguard_refresh_token', d.refreshToken);
    localStorage.setItem('nexguard_admin', JSON.stringify(d.admin || d));
    setAuthToken(d.accessToken);
    setToken(d.accessToken);
    setAdmin(d.admin || d);
  };

  const logout = () => {
    localStorage.removeItem('nexguard_token');
    localStorage.removeItem('nexguard_refresh_token');
    localStorage.removeItem('nexguard_admin');
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