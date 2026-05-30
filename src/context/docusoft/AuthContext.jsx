import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, setAuthToken, setupInterceptors } from '../../services/docusoft';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('docusoft_user')); } catch { return null; }
  });
  const [token, setToken] = useState(localStorage.getItem('docusoft_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) setAuthToken(token);
    setupInterceptors(() => {
      localStorage.removeItem('docusoft_token');
      localStorage.removeItem('docusoft_user');
      setToken(null);
      setUser(null);
      window.location.href = '/docusoft/login';
    });
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    localStorage.setItem('docusoft_token', data.token);
    localStorage.setItem('docusoft_user', JSON.stringify(data.user));
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('docusoft_token');
    localStorage.removeItem('docusoft_user');
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