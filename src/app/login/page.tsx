"use client";

import { useState, FormEvent } from 'react';
import { useLogin } from '@/presentation/hooks/useLogin';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ValidationErrors {
  username?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loading } = useLogin();

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Username harus diisi';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    } else if (username.trim().length > 50) {
      newErrors.username = 'Username maksimal 50 karakter';
    }

    if (!password) {
      newErrors.password = 'Password harus diisi';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    } else if (password.length > 100) {
      newErrors.password = 'Password maksimal 100 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({ username: username.trim(), password });

      if (result.success) {
        toast.success('Login berhasil!');
      } else {
        const errorMessage = result.error || 'Login gagal. Periksa kembali username dan password Anda.';
        setErrors({
          general: errorMessage
        });
      }
    } catch {
      const errorMessage = 'Login gagal. Periksa kembali username dan password Anda.';
      setErrors({
        general: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2 bg-white flex grow items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:mb-8 text-center">
            <div className="w-full h-24 sm:h-28 lg:h-32 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Login Logo"
                width={200}
                height={128}
                className="max-w-full max-h-full object-contain"
                priority
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Selamat Datang Kembali
            </h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Silakan masukkan detail akun Anda untuk melanjutkan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {errors.general}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) {
                    setErrors(prev => ({ ...prev, username: undefined }));
                  }
                }}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 ${errors.username
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                placeholder="Masukkan username"
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: undefined }));
                  }
                }}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 ${errors.password
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                placeholder="Masukkan password"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="w-full py-2 sm:py-3 text-sm sm:text-base bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading || isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative">
        <div className="absolute inset-0">
          <Image
            src="/login.jpg"
            alt="Login Background"
            layout="fill"
            objectFit="cover"
            className="opacity-90"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center p-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-white drop-shadow-md mb-4">
            Inovasi Berkelanjutan Untuk Indonesia
          </h2>
        </div>
      </div>
    </div>
  );
}
