import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, setAuthToken, setupInterceptors } from '../../services/flax';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('flax_admin')); } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('flax_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) setAuthToken(token);
    setupInterceptors(() => {
      localStorage.removeItem('flax_token');
      localStorage.removeItem('flax_admin');
      setToken(null);
      setAdmin(null);
      window.location.href = '/flax/login';
    });
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    const d = data.data || data;
    localStorage.setItem('flax_token', d.token);
    localStorage.setItem('flax_admin', JSON.stringify(d.admin));
    setAuthToken(d.token);
    setToken(d.token);
    setAdmin(d.admin);
  };

  const logout = () => {
    localStorage.removeItem('flax_token');
    localStorage.removeItem('flax_admin');
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