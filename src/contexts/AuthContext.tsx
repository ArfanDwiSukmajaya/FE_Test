"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { JwtUtils } from '@/shared/utils/JwtUtils';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  token: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
  isTokenExpired: () => boolean;
  getTimeUntilExpiration: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (storedToken && isLoggedIn === 'true') {
      if (JwtUtils.isTokenExpired(storedToken)) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('isLoggedIn');
        setIsAuthenticated(false);
        setUsername(null);
        setToken(null);
        router.push('/login');
      } else {
        setIsAuthenticated(true);
        setUsername(storedUsername);
        setToken(storedToken);
      }
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!loading && isAuthenticated && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, pathname, router]);

  const login = (newToken: string, newUsername: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    localStorage.setItem('isLoggedIn', 'true');
    setToken(newToken);
    setUsername(newUsername);
    setIsAuthenticated(true);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isLoggedIn');
    setToken(null);
    setUsername(null);
    setIsAuthenticated(false);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const payload = JwtUtils.decodeToken(token);
    if (!payload) {
      logout();
      return;
    }

    const expirationTime = payload.exp * 1000;
    const now = Date.now();
    const timeUntilExpiration = expirationTime - now;

    if (timeUntilExpiration <= 0) {
      logout();
      return;
    }

    const timeoutId = setTimeout(() => {
      logout();
    }, timeUntilExpiration);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated, token, logout]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && token) {
        if (JwtUtils.isTokenExpired(token)) {
          logout();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, token, logout]);

  const isTokenExpired = () => {
    if (!token) return true;
    return JwtUtils.isTokenExpired(token);
  };

  const getTimeUntilExpiration = () => {
    if (!token) return 0;
    return JwtUtils.getTimeUntilExpiration(token);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" >
        <div className="text-center" >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" > </div>
          <p className="mt-4 text-gray-600" > Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      username,
      token,
      login,
      logout,
      isTokenExpired,
      getTimeUntilExpiration
    }
    }>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
