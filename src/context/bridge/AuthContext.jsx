import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, setAuthToken, setupInterceptors } from '../../services/bridge';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bridge_admin')); } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('bridge_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) setAuthToken(token);
    setupInterceptors(() => {
      localStorage.removeItem('bridge_token');
      localStorage.removeItem('bridge_admin');
      setToken(null);
      setAdmin(null);
      window.location.href = '/bridge/login';
    });
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    localStorage.setItem('bridge_token', data.token);
    localStorage.setItem('bridge_admin', JSON.stringify(data.admin));
    setAuthToken(data.token);
    setToken(data.token);
    setAdmin(data.admin);
  };

  const logout = () => {
    localStorage.removeItem('bridge_token');
    localStorage.removeItem('bridge_admin');
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