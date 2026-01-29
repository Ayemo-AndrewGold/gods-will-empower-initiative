'use client';

import { ReactNode, useState, useEffect } from "react";
import Topbar from "@/components/admin/Topbar"
import Sidebar from "@/components/admin/Sidebar"

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    };

    initializeTheme();

    // Listen for theme changes
    const checkTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      const htmlHasDark = document.documentElement.classList.contains('dark');
      const newDarkMode = savedTheme === 'dark' || htmlHasDark;
      
      if (newDarkMode !== isDarkMode) {
        setIsDarkMode(newDarkMode);
      }
    };

    // Check theme periodically
    const themeInterval = setInterval(checkTheme, 300);

    // Listen for storage changes (theme changes from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        initializeTheme();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(themeInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isDarkMode]);

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

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
    }`}>
      {/* Header */}
      <Topbar /> 
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main 
        className={`${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        } pt-16 min-h-screen transition-all duration-300 ease-in-out`}
      >
        {/* Content Container with Professional Styling */}
        <div className="max-w-[1600px] mx-auto">
          {/* Content wrapper with dark mode support */}
          <div className={`rounded-2xl shadow-sm pt-3 min-h-[calc(100vh-7rem)] transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-gray-800/50 backdrop-blur-sm' 
              : 'bg-white/50 backdrop-blur-sm'
          }`}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}