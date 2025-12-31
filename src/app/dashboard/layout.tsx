"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Users,
  FileText,
  DollarSign,
  Bell,
  Menu,
  X,
  Settings,
  LogOut,
  Search,
} from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { name: "Dashboard", icon: Home, href: "/dashboard" },
    { name: "Users", icon: Users, href: "/dashboard/users" },
    { name: "Loan Requests", icon: FileText, href: "/loans" },
    { name: "Transactions", icon: DollarSign, href: "/admin/transactions" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-md transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Image
                src="/logo.webp"
                width={40}
                height={40}
                alt="Logo"
                className="rounded-full"
              />
              <span className="text-lg font-bold text-black">Bank Admin</span>
            </div>
          )}
          <button
            className="text-gray-600 hover:text-[#32CD32]"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="mt-4 flex flex-col">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#32CD32] hover:text-white transition-colors ${
                sidebarOpen ? "justify-start" : "justify-center"
              }`}
            >
              <item.icon />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-auto mb-4">
          <button
            className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-500 hover:text-white transition-colors w-full ${
              sidebarOpen ? "justify-start" : "justify-center"
            }`}
          >
            <LogOut />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6 md:px-10">
          {/* Left - Page title */}
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>

          {/* Center - Search */}
          <div className="flex items-center flex-1 mx-4 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-10 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          {/* Right - Notifications & Avatar */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative text-gray-700 hover:text-[#32CD32] transition">
              <Bell size={24} />
              <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            {/* Admin Avatar */}
            <Image
              src="/user-avatar.png"
              width={40}
              height={40}
              alt="Admin"
              className="rounded-full border border-gray-200"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
