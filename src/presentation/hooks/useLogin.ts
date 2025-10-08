// presentation/hooks/useLogin.ts
"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DIContainer } from '../../shared/container/DIContainer';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

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
        toast.success('Login berhasil!');
        router.push('/dashboard');
        return { success: true };
      } else {
        toast.error(result.error || 'Login gagal');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Terjadi kesalahan saat login');
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
