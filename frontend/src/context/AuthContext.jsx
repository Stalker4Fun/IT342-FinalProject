import { useState, useEffect } from 'react';
import api from '../api/axios';
import { AuthContext } from './authStore';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem('ecobite_token'));
  const [loading, setLoading] = useState(true);

  // Fetch current user from server whenever token is initialized or refreshed
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = sessionStorage.getItem('ecobite_token');
      if (storedToken) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load user profile with existing token', err);
          sessionStorage.removeItem('ecobite_token');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = (authToken, userData) => {
    sessionStorage.setItem('ecobite_token', authToken);
    setToken(authToken);
    setUser(userData);
  };

  const clearSession = () => {
    sessionStorage.removeItem('ecobite_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      // Ignore logout errors as client-side cleanup is priority
      console.warn('Logout notification to backend failed or token already invalid', err);
    } finally {
      clearSession();
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to refresh user profile', err);
      return null;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    clearSession,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
