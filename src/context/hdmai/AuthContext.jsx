import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, setAuthToken, setupInterceptors } from '../../services/hdmai';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hdmai_admin')); } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('hdmai_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) setAuthToken(token);
    setupInterceptors(() => {
      localStorage.removeItem('hdmai_token');
      localStorage.removeItem('hdmai_admin');
      setToken(null);
      setAdmin(null);
      window.location.href = '/hdmai/login';
    });
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await loginApi(email, password);
    const data = res.data || res;
    localStorage.setItem('hdmai_token', data.accessToken);
    localStorage.setItem('hdmai_admin', JSON.stringify(data));
    setAuthToken(data.accessToken);
    setToken(data.accessToken);
    setAdmin(data);
  };

  const logout = () => {
    localStorage.removeItem('hdmai_token');
    localStorage.removeItem('hdmai_admin');
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