import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nfc_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('nfc_auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('nfc_auth_token');
      if (savedToken) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
          localStorage.setItem('nfc_user', JSON.stringify(profile));
        } catch (error) {
          console.warn('[AuthContext] Session expired or invalid:', error.message);
          localStorage.removeItem('nfc_auth_token');
          localStorage.removeItem('nfc_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('nfc_auth_token', data.token);
    localStorage.setItem('nfc_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (name, email, password, role) => {
    const data = await authApi.register(name, email, password, role);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('nfc_auth_token', data.token);
    localStorage.setItem('nfc_user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    localStorage.removeItem('nfc_auth_token');
    localStorage.removeItem('nfc_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
