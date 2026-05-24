import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, setAuthToken, setupInterceptors } from '../../services/smartpos';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, read from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('smartpos_admin_token');
    const storedAdmin = localStorage.getItem('smartpos_admin_user');
    
    if (storedToken) {
      setToken(storedToken);
      setAuthToken(storedToken);
    }
    if (storedAdmin) {
      try { setAdmin(JSON.parse(storedAdmin)); } catch { setAdmin(null); }
    }
    
    setupInterceptors(() => {
      localStorage.removeItem('smartpos_admin_token');
      localStorage.removeItem('smartpos_admin_user');
      setToken(null);
      setAdmin(null);
      window.location.href = '/smartpos/login';
    });
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    localStorage.setItem('smartpos_admin_token', data.token);
    localStorage.setItem('smartpos_admin_user', JSON.stringify(data.admin));
    setAuthToken(data.token);
    setToken(data.token);
    setAdmin(data.admin);
  };

  const logout = () => {
    localStorage.removeItem('smartpos_admin_token');
    localStorage.removeItem('smartpos_admin_user');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ 
      admin, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!token, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}