// components/Header.tsx
"use client";

import { useState, useEffect } from 'react';
import { User, LogOut, Clock, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmModal from './ConfirmModal';
import { JwtUtils } from '../../../shared/utils/JwtUtils';

interface HeaderProps {
  onMenuClick?: () => void;
  isMenuOpen?: boolean;
}

export default function Header({ onMenuClick, isMenuOpen }: HeaderProps) {
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
      <div className="flex items-center gap-4">
        {/* Hamburger Menu untuk Mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Bagian Kanan Header */}
      <div className="flex items-center space-x-2 lg:space-x-4">
        {/* Token Expiration Info - Hidden on mobile */}
        {timeUntilExpiration && (
          <div className="hidden md:flex items-center gap-2 text-gray-600">
            <Clock size={16} />
            <span className="text-xs">
              Session: {timeUntilExpiration}
            </span>
          </div>
        )}

        {/* User Info */}
        <div className="flex items-center gap-2 text-gray-700">
          <User size={20} />
          <span className="hidden sm:block text-sm font-medium">{username || 'User'}</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-2 px-2 lg:px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
          <span className="hidden sm:block text-sm font-medium">Logout</span>
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