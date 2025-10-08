"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart3, Settings, ChevronDown } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isLaporanOpen, setIsLaporanOpen] = useState(true);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white p-5
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:flex-shrink-0
      `}>
        <div className="mb-10 flex justify-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={60}
            height={40}
            className="object-contain"
            priority
          />
        </div>
        <nav>
          <ul>
            <li>
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 py-2.5 px-4 my-2 rounded-md transition duration-200 hover:bg-gray-700 ${pathname === '/dashboard' ? 'bg-blue-600' : ''
                  }`}
                onClick={onClose}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
            </li>

            <li>
              <button
                onClick={() => setIsLaporanOpen(!isLaporanOpen)}
                className="flex items-center justify-between w-full py-2.5 px-4 my-2 rounded-md transition duration-200 hover:bg-gray-700"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={20} />
                  <span>Laporan Lalin</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${isLaporanOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {isLaporanOpen && (
                <ul className="ml-4 mt-1">
                  <li>
                    <Link
                      href="/laporan-lalin/laporan-per-hari"
                      className={`block py-2 px-4 my-1 rounded-md transition duration-200 hover:bg-gray-700 ${pathname === '/laporan-lalin/laporan-per-hari' ? 'bg-blue-600' : ''
                        }`}
                      onClick={onClose}
                    >
                      Laporan Per Hari
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <Link
                href="/master-gerbang"
                className={`flex items-center gap-3 py-2.5 px-4 my-2 rounded-md transition duration-200 hover:bg-gray-700 ${pathname === '/master-gerbang' ? 'bg-blue-600' : ''
                  }`}
                onClick={onClose}
              >
                <Settings size={20} />
                <span>Master Gerbang</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}