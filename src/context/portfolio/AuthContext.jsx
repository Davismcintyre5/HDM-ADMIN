import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, setAuthToken, setupInterceptors } from '../../services/portfolio';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('portfolio_user')); } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('portfolio_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) setAuthToken(token);
    setupInterceptors(() => {
      localStorage.removeItem('portfolio_token');
      localStorage.removeItem('portfolio_user');
      setToken(null);
      setUser(null);
      window.location.href = '/portfolio/login';
    });
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    localStorage.setItem('portfolio_token', data.token);
    localStorage.setItem('portfolio_user', JSON.stringify(data.user));
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('portfolio_token');
    localStorage.removeItem('portfolio_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}