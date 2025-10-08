// app/(private)/layout.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/presentation/components/ui/Sidebar';
import Header from '@/presentation/components/ui/Header';
import { Toaster } from 'react-hot-toast';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication immediately
    const token = localStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!token || isLoggedIn !== 'true') {
      // Tidak authenticated, redirect ke login
      router.push('/login');
    } else {
      // Authenticated, allow access
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, [router, pathname]);

  // Tampilkan loading saat checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Jika tidak authenticated, jangan render apapun (akan redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Jika authenticated, render layout normal
  return (
    <div className="flex h-screen bg-gray-100">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}