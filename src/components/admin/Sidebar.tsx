'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';

import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  TrendingUp
} from "lucide-react";

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/loans', label: 'Loans', icon: Wallet },
    { href: '/admin/repayments', label: 'Repayments', icon: Receipt },
    { href: '/admin/reports', label: 'Reports', icon: TrendingUp },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  // Broadcast sidebar state changes to other components (especially header)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isCollapsed } }));
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed]);

  // Load saved sidebar state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved) {
        setIsCollapsed(JSON.parse(saved));
      }
    }
  }, []);

  // Listen for theme changes from header
  useEffect(() => {
    const checkTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      const isDark = savedTheme === 'dark' || document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Initial check
    checkTheme();

    // Listen for storage changes (theme changes from other tabs)
    window.addEventListener('storage', checkTheme);

    // Listen for custom theme toggle event
    const handleThemeChange = () => checkTheme();
    window.addEventListener('themeChange', handleThemeChange);

    // Check periodically for theme changes
    const interval = setInterval(checkTheme, 500);

    return () => {
      window.removeEventListener('storage', checkTheme);
      window.removeEventListener('themeChange', handleThemeChange);
      clearInterval(interval);
    };
  }, []);

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handle logout
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      background: isDarkMode ? '#111827' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#111827',
  });

  if (result.isConfirmed) {
    localStorage.clear();
    router.push('/login');
  }
};




  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } left-0 top-0 h-screen border-r shadow-lg fixed transition-all duration-300 ease-in-out z-50 ${
        isDarkMode
          ? 'bg-gray-900 border-gray-700'
          : 'bg-gradient-to-t from-white via-blue-50 to-white border-gray-200'
      } border-b shadow-sm z-40 transition-all duration-300 ease-in-out`}>
      {/* Header with Logo */}
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        {!isCollapsed ? (
          <div className='flex items-center gap-3'>
            <div className='relative w-10 h-10 flex items-center justify-center shadow-lg'>
              <Image src="/logo.webp" alt="Logo" width={60} height={60} />
            </div>
            <div>
              <h2 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                God's Will
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Microfinance
              </p>
            </div>
          </div>
        ) : (
          <div className='relative w-10 h-10  rounded-xl flex items-center justify-center shadow-lg'>
            <Image src="/logo.webp" alt="Logo" width={60} height={60} />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`absolute -right-3 top-20 ${
          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        } border-2 p-1.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-10`}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight size={16} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
        ) : (
          <ChevronLeft size={16} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
        )}
      </button>

      {/* Navigation */}
      <nav className='flex flex-col gap-1 p-4 mt-2'>
        {!isCollapsed && (
          <p className={`text-xs font-bold uppercase tracking-wider mb-3 px-3 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Menu
          </p>
        )}
        
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-3 transition-all duration-200 group relative rounded-xl ${
                isActive
                  ? isDarkMode
                    ? 'bg-lime-600 text-white shadow-lg shadow-lime-600/50'
                    : 'bg-lime-500 text-white shadow-lg shadow-lime-600/50 text-white shadow-lg shadow-blue-600/30'
                  : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? label : ''}
            >
              <Icon 
                size={20} 
                className={`flex-shrink-0 ${
                  isActive 
                    ? 'text-white' 
                    : isDarkMode 
                    ? 'text-gray-400 group-hover:text-white' 
                    : 'text-gray-600 group-hover:text-gray-900'
                }`}
              />
              
              <span className={`font-medium whitespace-nowrap transition-all duration-300 ${
                isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}>
                {label}
              </span>

              {/* Active indicator */}
              {isActive && !isCollapsed && (
                <div className='absolute right-3 w-1.5 h-1.5 bg-white rounded-full'></div>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <span className={`absolute left-full ml-6 px-3 py-2 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-900'
                } border text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl`}>
                  {label}
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 ${
                    isDarkMode ? 'bg-gray-800 border-l border-b border-gray-700' : 'bg-gray-900'
                  } rotate-45`}></span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button at Bottom */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 transition-all duration-200 group rounded-xl ${
            isDarkMode
              ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
              : 'text-red-600 hover:bg-red-50'
          } ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut 
            size={20} 
            className={`flex-shrink-0 ${
              isDarkMode ? 'text-red-400' : 'text-red-600'
            }`}
          />
          
          <span className={`font-medium whitespace-nowrap transition-all duration-300 ${
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}>
            Logout
          </span>

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <span className={`absolute left-full ml-6 px-3 py-2 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-900'
            } border text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl`}>
              Logout
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 ${
                isDarkMode ? 'bg-gray-800 border-l border-b border-gray-700' : 'bg-gray-900'
              } rotate-45`}></span>
            </span>
          )}
        </button>
      </div>

      {/* Version Info */}
      {!isCollapsed && (
        <div className={`absolute bottom-20 left-0 right-0 px-6 py-2 ${
          isDarkMode ? 'text-gray-600' : 'text-gray-400'
        }`}>
          <p className='text-xs text-center'>v1.0.0</p>
        </div>
      )}
    </aside>
  );
}