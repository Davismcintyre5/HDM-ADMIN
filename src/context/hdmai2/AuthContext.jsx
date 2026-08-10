import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, setAuthToken } from '../../services/hdmai2';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hdmai2_admin')); } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('hdmai2_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) setAuthToken(token);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    const d = data.data || data;
    localStorage.setItem('hdmai2_token', d.token);
    localStorage.setItem('hdmai2_admin', JSON.stringify(d.admin || d));
    setAuthToken(d.token);
    setToken(d.token);
    setAdmin(d.admin || d);
  };

  const logout = () => {
    localStorage.removeItem('hdmai2_token');
    localStorage.removeItem('hdmai2_admin');
    setToken(null); setAdmin(null);
    setAuthToken(null);
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