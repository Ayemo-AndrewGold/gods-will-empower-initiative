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

  // Listen for sidebar toggle events to adjust main content
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <Topbar /> 
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content Area */}
      <main 
        className={`${
          sidebarCollapsed ? 'ml-20' : 'ml-65'
        } pt-16 p-6 min-h-screen transition-all duration-300 ease-in-out`}
      >
        {/* Content Container with Professional Styling */}
        <div className="max-w-[1600px] mx-auto">
          {/* Optional: Add a subtle content wrapper */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm p-6 min-h-[calc(100vh-7rem)]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}