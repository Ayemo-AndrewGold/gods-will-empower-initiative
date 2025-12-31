'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bell, Moon, Search, Sun, X } from 'lucide-react';

export default function AdminHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New order received', time: '5 min ago', unread: true },
    { id: 2, message: 'Product stock low', time: '1 hour ago', unread: true },
    { id: 3, message: 'Payment confirmed', time: '2 hours ago', unread: false },
    { id: 4, message: 'New customer registered', time: '5 hours ago', unread: false }
  ]);
  const [unreadCount, setUnreadCount] = useState(2);

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event: any) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);

    // Check initial state from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved) {
        setSidebarCollapsed(JSON.parse(saved));
      }
    }

    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
    }
  };

  // Load theme preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
      }
    }
  }, []);

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Add your search logic here
    }
  };

  // Handle Enter key for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Mark notifications as read
  const markAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <header 
      className={`fixed top-0 ${
        sidebarCollapsed ? 'left-20' : 'left-65'
      } right-0 h-16 bg-linear-to-l from-green-500 via-green-50 to-green-300 border-b border-gray-200 shadow-md z-40 font-[lexend] transition-all duration-300 ease-in-out`}
    >
      <div className='h-full px-6 flex items-center justify-between'>
        {/* Left Section */}
        <div className='flex items-center gap-5'>
          <h1 className='font-semibold text-[1.1rem] text-gray-800'>Welcome! 👋</h1>
          
          {/* Search Bar */}
          <div className='relative'>
            <div className='flex items-center px-4 py-2 bg-white rounded-full border border-gray-300 focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all duration-200 shadow-sm hover:shadow-md'>
              <input
                type='text'
                placeholder='Search...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className='w-64 focus:outline-none bg-transparent text-gray-700 placeholder-gray-400'
              />
              <button onClick={handleSearch} aria-label='Search'>
                <Search className='text-gray-500 hover:text-blue-600 transition-colors cursor-pointer' size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className='flex items-center gap-4'>
          {/* Notifications */}
          <div className='relative'>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className='relative cursor-pointer bg-white p-2 rounded-full hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md'
              aria-label='Notifications'
            >
              <Bell size={24} className='text-gray-700' />
              {unreadCount > 0 && (
                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className='absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50'>
                <div className='flex items-center justify-between px-4 py-2 border-b border-gray-200'>
                  <h3 className='font-semibold text-gray-800'>Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className='text-gray-500 hover:text-gray-700'
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className='max-h-96 overflow-y-auto'>
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        notif.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p className={`text-sm ${notif.unread ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                        {notif.message}
                      </p>
                      <p className='text-xs text-gray-400 mt-1'>{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className='px-4 py-2 border-t border-gray-200'>
                  <button
                    onClick={markAsRead}
                    className='text-sm text-blue-600 hover:text-blue-800 font-medium'
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className='relative flex items-center gap-1 bg-gradient-to-r from-gray-200 to-gray-300 p-1 rounded-full cursor-pointer hover:shadow-md transition-all duration-300'
            aria-label='Toggle dark mode'
          >
            <div
              className={`absolute w-8 h-8 bg-white rounded-full shadow-md transition-transform duration-300 ${
                isDarkMode ? 'translate-x-8' : 'translate-x-0'
              }`}
            />
            <Sun
              size={28}
              className={`p-1 z-10 transition-colors duration-300 ${
                !isDarkMode ? 'text-yellow-500' : 'text-gray-400'
              }`}
            />
            <Moon
              size={28}
              className={`p-1 z-10 transition-colors duration-300 ${
                isDarkMode ? 'text-indigo-600' : 'text-gray-400'
              }`}
            />
          </button>

          {/* User Profile */}
          <div className='flex items-center gap-2 cursor-pointer hover:bg-white/50 px-3 py-1 rounded-full transition-all duration-200'>
            <Image
              src='/avatar.webp'
              alt='Admin Profile Picture'
              width={40}
              height={40}
              className='w-10 h-10 rounded-full bg-gray-300 ring-2 ring-blue-200'
              priority
            />
            <div>
              <h2 className='font-semibold text-gray-800'>Kio</h2>
              <p className='text-[12px] text-gray-500'>Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}