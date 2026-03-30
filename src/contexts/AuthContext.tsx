/**
 * Authentication Context
 * ====================
 * Provides authentication state and methods throughout the app.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, storage, User, LoginRequest, RegisterRequest } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = storage.getAccessToken();
      const savedUser = storage.getUser();

      if (token && savedUser) {
        setState({
          user: savedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Verify token is still valid
        try {
          const user = await api.getProfile();
          storage.setUser(user);
          setState((prev) => ({ ...prev, user }));
        } catch (error) {
          // Token expired or invalid
          storage.clearAll();
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    const token = storage.getAccessToken();
    const refreshToken = storage.getRefreshToken();

    if (!token || !refreshToken) return;

    // Check token expiry (assume 30 minutes, refresh at 5 minutes remaining)
    const refreshInterval = 25 * 60 * 1000; // 25 minutes

    const interval = setInterval(async () => {
      try {
        const tokens = await api.refreshToken(refreshToken);
        storage.setAccessToken(tokens.access_token);
        storage.setRefreshToken(tokens.refresh_token);
      } catch (error) {
        // Refresh failed, logout
        logout();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const tokens = await api.login(email, password);
      storage.setAccessToken(tokens.access_token);
      storage.setRefreshToken(tokens.refresh_token);

      const user = await api.getProfile();
      storage.setUser(user);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed',
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await api.register(data);

      // Auto-login after registration
      await login(data.email, data.password);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Registration failed',
      }));
      throw error;
    }
  }, [login]);

  const logout = useCallback(() => {
    const refreshToken = storage.getRefreshToken();

    if (refreshToken) {
      api.logout(refreshToken).catch(() => {
        // Ignore logout errors
      });
    }

    storage.clearAll();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await api.getProfile();
      storage.setUser(user);
      setState((prev) => ({ ...prev, user }));
    } catch (error) {
      // If refresh fails, logout
      logout();
    }
  }, [logout]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const updateUser = useCallback((user: User) => {
    storage.setUser(user);
    setState((prev) => ({ ...prev, user }));
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

// Guest Route Component (for login/register pages)
interface GuestRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};
