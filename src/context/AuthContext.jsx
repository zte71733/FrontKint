import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { AuthContext } from './Contexts';

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('kint_token') ? true : false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kint_user');
      return (saved && saved !== 'undefined') ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(() => {
    const token = localStorage.getItem('kint_token');
    const user = localStorage.getItem('kint_user');
    return !(token && user);
  });

  useEffect(() => {
    if (currentUser) localStorage.setItem('kint_user', JSON.stringify(currentUser));
    else localStorage.removeItem('kint_user');
  }, [currentUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('kint_token');
    localStorage.removeItem('kint_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('kint_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.get('/api/users/me');
      if (data && data.password) delete data.password;
      setCurrentUser(data);
      setIsAuthenticated(true);
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    Promise.resolve().then(() => {
      checkAuth();
    });

    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [checkAuth, logout]);

  const login = async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('kint_token', data.token);
      const user = await api.get('/api/users/me');
      if (user && user.password) delete user.password;
      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    }
  };

  const register = async (name, email, password) => {
    await api.post('/api/auth/register', { name, email, password });
    return login(email, password);
  };

  const updateCurrentUser = (updates) => {
    setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      updateCurrentUser,
      isLoading,
      login,
      register,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}
