"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DIContainer } from '../../shared/container/DIContainer';
import { useAuth } from '../../contexts/AuthContext';

export interface LoginFormData {
  username: string;
  password: string;
}

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const login = useCallback(async (credentials: LoginFormData) => {
    setLoading(true);

    try {
      const authUseCase = DIContainer.getInstance().getAuthUseCase();

      const result = await authUseCase.login(credentials);

      if (result.success && result.user) {
        authLogin(result.user.token || '', result.user.username || credentials.username);
        router.push('/dashboard');
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Login error:', error);
      }
      return { success: false, error: 'Terjadi kesalahan saat login' };
    } finally {
      setLoading(false);
    }
  }, [router, authLogin]);

  return {
    login,
    loading
  };
}
