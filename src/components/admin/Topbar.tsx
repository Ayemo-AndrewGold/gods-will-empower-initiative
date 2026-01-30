'use client';

import { useState, useEffect } from 'react';
import { Bell, Moon, Search, Sun, X, User, LogOut, Settings, ChevronDown, Users, Wallet, CreditCard, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

// const API_URL = 'http://localhost:5000/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API Services
const authService = {
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch user data');
    const response = await res.json();
    return response.data || response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('notifications');
    window.location.href = '/login';
  }
};

const notificationService = {
  getNotifications: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      // Fallback to localStorage
      const stored = localStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    }
    const response = await res.json();
    return response.data || response;
  },

  markAsRead: async (id?: string) => {
    const token = localStorage.getItem('token');
    const endpoint = id ? `${API_URL}/notifications/${id}/read` : `${API_URL}/notifications/read-all`;
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      // Fallback to localStorage update
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const notifs = JSON.parse(stored).map((n: any) => 
          id ? (n.id === id ? { ...n, read: true } : n) : { ...n, read: true }
        );
        localStorage.setItem('notifications', JSON.stringify(notifs));
        return notifs;
      }
    }
    return res.json();
  }
};

const searchService = {
  globalSearch: async (query: string) => {
    const token = localStorage.getItem('token');
    const lowerQuery = query.toLowerCase();
    const results: any[] = [];

    try {
      // Search customers
      const customersRes = await fetch(`${API_URL}/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        const customers = (customersData.data || customersData || [])
          .filter((c: any) => 
            c.firstName?.toLowerCase().includes(lowerQuery) ||
            c.lastName?.toLowerCase().includes(lowerQuery) ||
            c.phoneNumber?.includes(query) ||
            c.customerId?.toLowerCase().includes(lowerQuery) ||
            c.email?.toLowerCase().includes(lowerQuery)
          )
          .map((c: any) => ({
            id: c._id,
            type: 'customer',
            title: `${c.firstName} ${c.lastName}`,
            subtitle: c.customerId,
            description: c.phoneNumber,
            route: '/admin/customers',
            data: c
          }));
        results.push(...customers);
      }

      // Search loans
      const loansRes = await fetch(`${API_URL}/loans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (loansRes.ok) {
        const loansData = await loansRes.json();
        const loans = (loansData.data || loansData || [])
          .filter((l: any) => 
            l.loanId?.toLowerCase().includes(lowerQuery) ||
            l.customer?.firstName?.toLowerCase().includes(lowerQuery) ||
            l.customer?.lastName?.toLowerCase().includes(lowerQuery)
          )
          .map((l: any) => ({
            id: l._id,
            type: 'loan',
            title: `Loan ${l.loanId}`,
            subtitle: `${l.customer?.firstName || ''} ${l.customer?.lastName || ''}`,
            description: `${l.loanProduct} - ₦${l.principalAmount?.toLocaleString()}`,
            route: '/admin/loans',
            data: l
          }));
        results.push(...loans);
      }

      // Search repayments
      const repaymentsRes = await fetch(`${API_URL}/repayments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (repaymentsRes.ok) {
        const repaymentsData = await repaymentsRes.json();
        const repayments = (repaymentsData.data || repaymentsData || [])
          .filter((r: any) => 
            r.repaymentId?.toLowerCase().includes(lowerQuery) ||
            r.loan?.loanId?.toLowerCase().includes(lowerQuery)
          )
          .map((r: any) => ({
            id: r._id,
            type: 'payment',
            title: `Payment ${r.repaymentId || r._id.slice(-6)}`,
            subtitle: r.loan?.loanId || 'Payment',
            description: `₦${r.paymentAmount?.toLocaleString()}`,
            route: '/admin/repayments',
            data: r
          }));
        results.push(...repayments);
      }

      return results;
    } catch (err) {
      console.error('Search error:', err);
      return results;
    }
  }
};

export default function AdminHeader() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
  }, []);

  // Fetch current user on mount
  useEffect(() => {
    fetchCurrentUser();
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setLoadingUser(true);
      const data = await authService.getCurrentUser();
      setCurrentUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (err: any) {
      console.error('Error fetching user:', err);
      // Try to get user from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      } else if (err.message.includes('No token') || err.message.includes('Failed to fetch')) {
        authService.logout();
      }
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      const notifs = Array.isArray(data) ? data : [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: any) => !n.read).length);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Listen for new notifications from system events
  useEffect(() => {
    const handleNewNotification = (event: any) => {
      const newNotif = {
        id: Date.now().toString(),
        message: event.detail.message,
        type: event.detail.type || 'info',
        time: 'Just now',
        read: false,
        createdAt: new Date().toISOString()
      };
      
      setNotifications(prev => {
        const updated = [newNotif, ...prev];
        localStorage.setItem('notifications', JSON.stringify(updated));
        return updated;
      });
      setUnreadCount(prev => prev + 1);
    };

    // Listen for customer registration
    const handleCustomerRegistered = (event: any) => {
      handleNewNotification({
        detail: {
          message: `New customer registered: ${event.detail.customerName}`,
          type: 'customer'
        }
      });
    };

    // Listen for loan application
    const handleLoanApplied = (event: any) => {
      handleNewNotification({
        detail: {
          message: `New loan application from ${event.detail.customerName} for ₦${event.detail.amount?.toLocaleString()}`,
          type: 'loan'
        }
      });
    };

    // Listen for payment received
    const handlePaymentReceived = (event: any) => {
      handleNewNotification({
        detail: {
          message: `Payment received: ₦${event.detail.amount?.toLocaleString()} for loan ${event.detail.loanId}`,
          type: 'payment'
        }
      });
    };

    // Listen for approval needed
    const handleApprovalNeeded = (event: any) => {
      handleNewNotification({
        detail: {
          message: `${event.detail.type} awaiting approval: ${event.detail.name}`,
          type: 'approval'
        }
      });
    };

    window.addEventListener('newNotification', handleNewNotification);
    window.addEventListener('customerRegistered', handleCustomerRegistered);
    window.addEventListener('loanApplied', handleLoanApplied);
    window.addEventListener('paymentReceived', handlePaymentReceived);
    window.addEventListener('approvalNeeded', handleApprovalNeeded);

    return () => {
      window.removeEventListener('newNotification', handleNewNotification);
      window.removeEventListener('customerRegistered', handleCustomerRegistered);
      window.removeEventListener('loanApplied', handleLoanApplied);
      window.removeEventListener('paymentReceived', handlePaymentReceived);
      window.removeEventListener('approvalNeeded', handleApprovalNeeded);
    };
  }, [notifications]);

  // Listen for sidebar toggle
  useEffect(() => {
    const handleSidebarToggle = (event: any) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);

    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved) {
      setSidebarCollapsed(JSON.parse(saved));
    }

    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);

  // Dark mode toggle with proper class management
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Handle search with debounce
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const timer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const results = await searchService.globalSearch(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchResultClick = (result: any) => {
    // Store the result data for highlighting/filtering on the destination page
    sessionStorage.setItem('searchHighlight', result.id);
    sessionStorage.setItem('searchData', JSON.stringify(result.data));
    
    // Navigate to the appropriate page
    router.push(result.route);
    
    // Clear search
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Mark notifications as read
  const markAsRead = async (id?: string) => {
    try {
      await notificationService.markAsRead(id);
      
      setNotifications(prev => {
        const updated = prev.map(n => 
          id ? (n.id === id ? { ...n, read: true } : n) : { ...n, read: true }
        );
        localStorage.setItem('notifications', JSON.stringify(updated));
        return updated;
      });
      
      if (!id) {
        setUnreadCount(0);
      } else {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
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

  // Navigate to settings
  const goToSettings = () => {
    router.push('/admin/settings');
    setShowProfileMenu(false);
  };

  // Get notification style
  const getNotificationStyle = (type: string) => {
    switch(type) {
      case 'customer': return { bg: 'bg-blue-100', text: 'text-blue-600', icon: '👤' };
      case 'loan': return { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: '💰' };
      case 'payment': return { bg: 'bg-green-100', text: 'text-green-600', icon: '✅' };
      case 'report': return { bg: 'bg-purple-100', text: 'text-purple-600', icon: '📊' };
      case 'approval': return { bg: 'bg-orange-100', text: 'text-orange-600', icon: '⏳' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-600', icon: '🔔' };
    }
  };

  // Get search result icon
  const getSearchIcon = (type: string) => {
    switch(type) {
      case 'customer': return <Users className="w-4 h-4" />;
      case 'loan': return <Wallet className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (!currentUser) return '?';
    const first = currentUser.firstName?.charAt(0) || currentUser.username?.charAt(0) || '';
    const last = currentUser.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '??';
  };

  // Format time for notifications
  const formatNotificationTime = (time: string) => {
    if (time === 'Just now') return time;
    
    try {
      const date = new Date(time);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return time;
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notification-dropdown') && !target.closest('.notification-button')) {
        setShowNotifications(false);
      }
      if (!target.closest('.profile-dropdown') && !target.closest('.profile-button')) {
        setShowProfileMenu(false);
      }
      if (!target.closest('.search-dropdown') && !target.closest('.search-input')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  

  return (
    <header 
      className={`fixed top-0 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      } right-0 h-16 ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-gradient-to-r from-white via-blue-50 to-white border-gray-200'
      } border-b shadow-sm z-40 transition-all duration-300 ease-in-out`}
    >
      <div className='h-full px-4 flex items-center justify-between'>
        {/* Left Section */}
        <div className='flex items-center gap-5'>
          <div>
            <h1 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Welcome back, {loadingUser ? '...' : currentUser?.firstName || currentUser?.username || 'User'}! 👋
            </h1>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          {/* Search Bar */}
          <div className='relative search-dropdown'>
            <div className={`flex items-center px-4 py-2 ${
              isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            } rounded-lg border focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all duration-200 shadow-sm hover:shadow-md`}>
              <input
                type='text'
                placeholder='Search customers, loans, payments...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`search-input w-64 focus:outline-none bg-transparent ${
                  isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-700 placeholder-gray-400'
                } text-sm`}
              />
              {searchLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              ) : (
                <Search className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} cursor-pointer`} size={20} />
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-2 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } rounded-lg shadow-xl border max-h-96 overflow-y-auto z-50`}>
                {searchResults.map((result, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSearchResultClick(result)}
                    className={`px-4 py-3 ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } cursor-pointer transition-colors border-b ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-100'
                    } last:border-b-0`}
                  >
                    <div className='flex items-center gap-3'>
                      <div className={`w-8 h-8 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-blue-100'
                      } rounded-lg flex items-center justify-center ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {getSearchIcon(result.type)}
                      </div>
                      <div className='flex-1'>
                        <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {result.title}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {result.subtitle} • {result.description}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {result.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showSearchResults && searchResults.length === 0 && searchQuery.trim() && !searchLoading && (
              <div className={`absolute top-full left-0 right-0 mt-2 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } rounded-lg shadow-xl border p-4 text-center z-50`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No results found for "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className='flex items-center gap-3'>
          {/* Notifications */}
          <div className='relative notification-dropdown'>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`notification-button relative cursor-pointer ${
                isDarkMode ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-100'
              } p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border`}
              aria-label='Notifications'
            >
              <Bell size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
              {unreadCount > 0 && (
                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse'>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-96 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } rounded-lg shadow-xl border py-2 z-50`}>
                <div className={`flex items-center justify-between px-4 py-3 border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Notifications
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className='max-h-96 overflow-y-auto'>
                  {notifications.length === 0 ? (
                    <div className='px-4 py-8 text-center'>
                      <Bell size={32} className={`mx-auto mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const style = getNotificationStyle(notif.type);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`px-4 py-3 ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          } cursor-pointer transition-colors border-l-4 ${
                            !notif.read 
                              ? isDarkMode 
                                ? 'bg-gray-700/50 border-blue-500' 
                                : 'bg-blue-50 border-blue-500' 
                              : 'border-transparent'
                          }`}
                        >
                          <div className='flex items-start gap-3'>
                            <div className={`w-8 h-8 ${style.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <span className='text-sm'>{style.icon}</span>
                            </div>
                            <div className='flex-1'>
                              <p className={`text-sm ${
                                !notif.read 
                                  ? isDarkMode ? 'font-semibold text-white' : 'font-semibold text-gray-800'
                                  : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {notif.message}
                              </p>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                                {formatNotificationTime(notif.time || notif.createdAt)}
                              </p>
                            </div>
                            {!notif.read && (
                              <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {notifications.length > 0 && unreadCount > 0 && (
                  <div className={`px-4 py-2 border-t ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  } flex items-center justify-between`}>
                    <button
                      onClick={() => markAsRead()}
                      className='text-sm text-blue-600 hover:text-blue-800 font-medium'
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`relative flex items-center gap-1 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            } p-1 rounded-full cursor-pointer hover:shadow-md transition-all duration-300 border ${
              isDarkMode ? 'border-gray-600' : 'border-gray-300'
            }`}
            aria-label='Toggle dark mode'
          >
            <div
              className={`absolute w-7 h-7 bg-white rounded-full shadow-md transition-transform duration-300 ${
                isDarkMode ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
            <Sun
              size={24}
              className={`p-1 z-10 transition-colors duration-300 ${
                !isDarkMode ? 'text-yellow-500' : 'text-gray-400'
              }`}
            />
            <Moon
              size={24}
              className={`p-1 z-10 transition-colors duration-300 ${
                isDarkMode ? 'text-indigo-400' : 'text-gray-400'
              }`}
            />
          </button>

          {/* User Profile */}
          <div className='relative profile-dropdown'>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`profile-button flex items-center gap-2 cursor-pointer ${
                isDarkMode ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-100'
              } px-3 py-2 rounded-lg transition-all duration-200 `}
            >
              {currentUser?.profilePicture ? (
                <img 
                  src={currentUser.profilePicture} 
                  alt={currentUser.firstName || currentUser.username}
                  className='w-9 h-9 rounded-full object-cover ring-2 ring-blue-200'
                />
              ) : (
                <div className={`w-9 h-9 rounded-full bg-green-500 text-white shadow-lg shadow-lime-600/50 ${isDarkMode ? 'bg-green-500' : 'bg-lime-500'} flex items-center justify-center text-white font-bold text-sm ring-2 ring-blue-200`}>
                  {getUserInitials()}
                </div>
              )}
              <div className='text-left'>
                <h2 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {loadingUser ? 'Loading...' : `${currentUser?.firstName || currentUser?.username || ''} ${currentUser?.lastName || ''}`}
                </h2>
                <p className={`text-xs capitalize ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentUser?.role === 'admin' ? '👑 Admin' : '👤 User'}
                </p>
              </div>
              <ChevronDown size={16} className={`${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className={`absolute right-0 mt-2 w-64 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } rounded-lg shadow-xl border py-2 z-50`}>
                <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {currentUser?.firstName || currentUser?.username} {currentUser?.lastName || ''}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {currentUser?.email || 'No email'}
                  </p>
                  <div className='flex items-center gap-2 mt-2'>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      currentUser?.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {currentUser?.role === 'admin' ? 'Administrator' : 'User'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      currentUser?.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {currentUser?.status || 'active'}
                    </span>
                  </div>
                </div>
                
                <div className='py-2'>
                  <button
                    onClick={goToSettings}
                    className={`w-full px-4 py-2 text-left text-sm ${
                      isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    } transition-colors flex items-center gap-3`}
                  >
                    <Settings size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                    Account Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`w-full px-4 py-2 text-left text-sm text-red-600 ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-red-50'
                    } transition-colors flex items-center gap-3`}
                  >
                    <LogOut size={16} className='text-red-500' />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}