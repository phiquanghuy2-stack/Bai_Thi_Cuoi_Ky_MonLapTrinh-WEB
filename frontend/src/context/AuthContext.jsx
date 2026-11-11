import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartmotel_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartmotel_token') || null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('smartmotel_token')));

  const refreshProfile = useCallback(async (signal) => {
    const storedToken = localStorage.getItem('smartmotel_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await axiosClient.get('/auth/me', { signal });
      const userData = response.data?.data;
      setUser(userData);
      localStorage.setItem('smartmotel_user', JSON.stringify(userData));
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
      localStorage.removeItem('smartmotel_token');
      localStorage.removeItem('smartmotel_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    refreshProfile(controller.signal);

    return () => {
      controller.abort();
    };
  }, [refreshProfile]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await axiosClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      const { user: loggedInUser, token: jwtToken } = response.data.data;

      localStorage.setItem('smartmotel_token', jwtToken);
      localStorage.setItem('smartmotel_user', JSON.stringify(loggedInUser));
      setToken(jwtToken);
      setUser(loggedInUser);

      return loggedInUser;
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const response = await axiosClient.post('/auth/register', {
        ...payload,
        email: payload.email.trim().toLowerCase(),
      });
      const { user: newUser, token: jwtToken } = response.data.data;

      localStorage.setItem('smartmotel_token', jwtToken);
      localStorage.setItem('smartmotel_user', JSON.stringify(newUser));
      setToken(jwtToken);
      setUser(newUser);

      return newUser;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('smartmotel_token');
    localStorage.removeItem('smartmotel_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      isTenant: user?.role === 'tenant',
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, loading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
