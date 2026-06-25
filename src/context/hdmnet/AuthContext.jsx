import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, setAuthToken, setupInterceptors } from '../../services/hdmnet';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hdmnet_user')); } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('hdmnet_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) setAuthToken(token);
    setupInterceptors(() => {
      localStorage.removeItem('hdmnet_token');
      localStorage.removeItem('hdmnet_refresh_token');
      localStorage.removeItem('hdmnet_user');
      setToken(null);
      setUser(null);
      window.location.href = '/hdmnet/login';
    });
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    localStorage.setItem('hdmnet_token', data.access_token);
    localStorage.setItem('hdmnet_refresh_token', data.refresh_token);
    localStorage.setItem('hdmnet_user', JSON.stringify(data.user));
    setAuthToken(data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('hdmnet_token');
    localStorage.removeItem('hdmnet_refresh_token');
    localStorage.removeItem('hdmnet_user');
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