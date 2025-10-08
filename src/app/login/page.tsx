// app/login/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import { useLogin } from '@/presentation/hooks/useLogin';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useLogin();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Use DDD architecture - call custom hook
    await login({ username, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* App Logo */}
          <div className="mb-8 text-center">
            <div className="w-full h-32 bg-gray-200 border-2 border-gray-300 flex items-center justify-center rounded-lg">
              <span className="text-gray-600 font-semibold text-xl">App Logo</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan password"
                required
              />
            </div>

            {/* Login Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Login'}
              </button>
            </div>
          </form>

          {/* Demo Credentials (for testing) */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 font-semibold mb-1">Demo Credentials:</p>
            <p className="text-xs text-blue-600">Username: Super Admin</p>
            <p className="text-xs text-blue-600">Password: password12345</p>
          </div>
        </div>
      </div>

      {/* Right Side - Background/Illustration */}
      <div className="w-1/2 bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center relative overflow-hidden">
        {/* Decorative geometric background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="0,0 100,0 50,50" fill="rgba(255,255,255,0.1)" />
              <polygon points="0,100 100,100 50,50" fill="rgba(0,0,0,0.05)" />
              <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
              <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            App Illustration/Background
          </h1>
          <p className="text-gray-600 text-lg">
            Sistem Informasi Lalu Lintas
          </p>
        </div>
      </div>
    </div>
  );
}
