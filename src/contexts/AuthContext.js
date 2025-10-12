import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { extractErrorMessage, ERROR_MESSAGES } from '../utils/errorHandler';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_URL = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api`;

  // Configure axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Set the token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Verify token by getting user info
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token might be expired, try to refresh
      await refreshToken();
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        logout();
        return;
      }

      const response = await axios.post(`${API_URL}/auth/refresh-token`, {
        refresh_token: refreshToken
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;
      
      // Update stored tokens
      localStorage.setItem('token', access_token);
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', newRefreshToken);
      
      // Update axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Get updated user info
      const userResponse = await axios.get(`${API_URL}/auth/me`);
      setUser(userResponse.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { access_token, refresh_token, user } = response.data;

      // Store tokens
      localStorage.setItem('token', access_token);
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Set axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      const message = extractErrorMessage(error, 'Login failed');
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Registering user with data:', userData);
      console.log('API URL:', `${API_URL}/auth/register`);
      
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      // After successful registration, log the user in
      const loginResult = await login(userData.email, userData.password);
      
      if (loginResult.success) {
        return { success: true, message: 'Registration successful' };
      } else {
        return { success: false, error: loginResult.error };
      }
    } catch (error) {
      console.error('Registration error details:', error);
      console.error('Error response:', error.response);
      const message = extractErrorMessage(error, 'Registration failed');
      console.log('Extracted error message:', message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    // Clear tokens
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Clear axios header
    delete axios.defaults.headers.common['Authorization'];
    
    setUser(null);
    setIsAuthenticated(false);
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to send reset email');
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      const message = extractErrorMessage(error, 'Password reset failed');
      return { success: false, error: message };
    }
  };

  // Axios interceptor for handling token expiration
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && isAuthenticated) {
          // Try to refresh token
          await refreshToken();
          
          // Retry original request
          if (error.config && !error.config._retry) {
            error.config._retry = true;
            const token = localStorage.getItem('access_token');
            if (token) {
              error.config.headers.Authorization = `Bearer ${token}`;
              return axios.request(error.config);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [isAuthenticated]);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};