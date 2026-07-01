import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, setAuthToken, setupInterceptors } from '../../services/farmwise';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('farmwise_admin')); } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('farmwise_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) setAuthToken(token);
    setupInterceptors(() => {
      localStorage.removeItem('farmwise_token');
      localStorage.removeItem('farmwise_admin');
      setToken(null);
      setAdmin(null);
      window.location.href = '/farmwise/login';
    });
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    const d = data.data || data;
    localStorage.setItem('farmwise_token', d.token || d.accessToken);
    localStorage.setItem('farmwise_admin', JSON.stringify(d.admin || d));
    setAuthToken(d.token || d.accessToken);
    setToken(d.token || d.accessToken);
    setAdmin(d.admin || d);
  };

  const logout = () => {
    localStorage.removeItem('farmwise_token');
    localStorage.removeItem('farmwise_admin');
    setToken(null);
    setAdmin(null);
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