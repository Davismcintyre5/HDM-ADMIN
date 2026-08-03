import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, setAuthToken, setupInterceptors } from '../../services/eduprime';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eduprime_admin')); } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('eduprime_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) setAuthToken(token);
    setupInterceptors(() => {
      localStorage.removeItem('eduprime_token');
      localStorage.removeItem('eduprime_refresh_token');
      localStorage.removeItem('eduprime_admin');
      setToken(null); setAdmin(null);
      window.location.href = '/eduprime/login';
    });
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    const d = data.data || data;
    localStorage.setItem('eduprime_token', d.token);
    localStorage.setItem('eduprime_refresh_token', d.refreshToken);
    localStorage.setItem('eduprime_admin', JSON.stringify(d.admin || d));
    setAuthToken(d.token);
    setToken(d.token);
    setAdmin(d.admin || d);
  };

  const logout = () => {
    localStorage.removeItem('eduprime_token');
    localStorage.removeItem('eduprime_refresh_token');
    localStorage.removeItem('eduprime_admin');
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