// components/Header.tsx
"use client";

import { useState, useEffect } from 'react';
import { User, LogOut, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmModal from './ConfirmModal';
import { JwtUtils } from '../../../shared/utils/JwtUtils';

export default function Header() {
  const { username, logout, token } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [timeUntilExpiration, setTimeUntilExpiration] = useState<string>('');

  useEffect(() => {
    if (!token) return;

    const updateTimeDisplay = () => {
      const timeStr = JwtUtils.formatTimeUntilExpiration(token);
      setTimeUntilExpiration(timeStr);
    };

    // Update immediately
    updateTimeDisplay();

    // Update every minute
    const interval = setInterval(updateTimeDisplay, 60000);

    return () => clearInterval(interval);
  }, [token]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      {/* Bagian Kiri Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700">Sistem Informasi Lalu Lintas</h2>
      </div>

      {/* Bagian Kanan Header */}
      <div className="flex items-center space-x-4">
        {/* Token Expiration Info */}
        {timeUntilExpiration && (
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} />
            <span className="text-xs">
              Session: {timeUntilExpiration}
            </span>
          </div>
        )}

        {/* User Info */}
        <div className="flex items-center gap-2 text-gray-700">
          <User size={20} />
          <span className="text-sm font-medium">{username || 'User'}</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

      {/* Confirm Logout Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari aplikasi?"
        confirmText="Ya, Logout"
        cancelText="Batal"
        type="danger"
      />
    </header>
  );
}