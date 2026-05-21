import { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin, setAuthToken, setupInterceptors } from '../../services/hdmai';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hdmai_admin')); } catch { return null; }
  });
  const [accessToken, setAccessToken] = useState(localStorage.getItem('hdmai_access_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      setAuthToken(accessToken);
    }
    setupInterceptors(() => {
      localStorage.removeItem('hdmai_access_token');
      localStorage.removeItem('hdmai_admin');
      setAccessToken(null);
      setAdmin(null);
      window.location.href = '/hdmai/login';
    });
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await adminLogin(email, password);
    localStorage.setItem('hdmai_access_token', data.access_token);
    localStorage.setItem('hdmai_admin', JSON.stringify({ email: data.email, username: data.username, role: data.role }));
    setAuthToken(data.access_token);
    setAccessToken(data.access_token);
    setAdmin({ email: data.email, username: data.username, role: data.role });
  };

  const logout = () => {
    localStorage.removeItem('hdmai_access_token');
    localStorage.removeItem('hdmai_admin');
    setAccessToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token: accessToken, login, logout, isAuthenticated: !!accessToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}