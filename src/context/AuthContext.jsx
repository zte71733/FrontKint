import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { MOCK_USERS } from '../mockData';
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

    if (token.startsWith('mock-token-')) {
      const userId = parseInt(token.replace('mock-token-', ''));
      const mockUser = MOCK_USERS.find(u => u.id === userId);
      if (mockUser) {
        setCurrentUser(mockUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
    }

    try {
      const data = await api.get('/api/users/me');
      setCurrentUser(data);
      setIsAuthenticated(true);
    } catch {
      if (!token.startsWith('mock-token-')) {
        logout();
      }
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
    const mockUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (mockUser) {
      localStorage.setItem('kint_token', `mock-token-${mockUser.id}`);
      setCurrentUser(mockUser);
      setIsAuthenticated(true);
      return mockUser;
    }

    const data = await api.post('/api/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('kint_token', data.token);
      const user = await api.get('/api/users/me');
      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    }
  };

  const register = async (name, email, password) => {
    try {
      await api.post('/api/auth/register', { name, email, password });
      return login(email, password);
    } catch {
      const newMockUser = {
        id: Date.now(),
        name,
        email,
        password,
        avatar: '',
        role: 'user',
        points: 0,
        level: 1,
        followingIds: [],
        followerIds: []
      };
      
      // Update DataContext DB
      try {
        const dbStr = localStorage.getItem('kint_db');
        const db = dbStr ? JSON.parse(dbStr) : {};
        if (db.users) {
          db.users.push(newMockUser);
        } else {
          db.users = [...MOCK_USERS, newMockUser];
        }
        localStorage.setItem('kint_db', JSON.stringify(db));
      } catch (e) {
        console.error('Failed to update mock db', e);
      }
      
      MOCK_USERS.push(newMockUser);
      localStorage.setItem('kint_token', `mock-token-${newMockUser.id}`);
      setCurrentUser(newMockUser);
      setIsAuthenticated(true);
      
      // Force reload to sync DataContext with new user
      window.location.href = '/feed';
      
      return newMockUser;
    }
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
