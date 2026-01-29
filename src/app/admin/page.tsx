"use client";

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Wallet, AlertCircle, CheckCircle,
  Download, ArrowUp, ArrowDown, MoreVertical, Loader2, RefreshCw,
  Eye, UserCheck, Clock, Target, BarChart3, Activity, FileText, XCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

// const API_URL = 'http://localhost:5000/api';
const API_URL = 'process.env.NEXT_PUBLIC_API_URL';

// Updated API Services - Using the same endpoints as other pages
const dashboardService = {
  // Get all customers
  getAllCustomers: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch customers');
    const response = await res.json();
    return response.data || response;
  },

  // Get all loans
  getAllLoans: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/loans`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch loans');
    const response = await res.json();
    return response.data || response;
  },

  // Get all repayments
  getAllRepayments: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/repayments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch repayments');
    const response = await res.json();
    return response.data || response;
  }
};

const COLORS = ['#FF6B35', '#F7931E', '#FDC830', '#4ECDC4', '#45B7D1', '#96CEB4'];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [monthlyPerformance, setMonthlyPerformance] = useState<any[]>([]);
  const [productDistribution, setProductDistribution] = useState<any[]>([]);
  const [loanStatus, setLoanStatus] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('Last 8 Days');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data from the working endpoints
      const [customersData, loansData, repaymentsData] = await Promise.all([
        dashboardService.getAllCustomers(),
        dashboardService.getAllLoans(),
        dashboardService.getAllRepayments()
      ]);

      setCustomers(Array.isArray(customersData) ? customersData : []);
      setLoans(Array.isArray(loansData) ? loansData : []);
      setRepayments(Array.isArray(repaymentsData) ? repaymentsData : []);

      // Process data to create dashboard metrics
      processData(customersData, loansData, repaymentsData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      // Set empty data on error
      setCustomers([]);
      setLoans([]);
      setRepayments([]);
      processData([], [], []);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    const checkDarkMode = () => {
      const savedTheme = localStorage.getItem('theme');
      const htmlHasDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(savedTheme === 'dark' || htmlHasDark);
    };

    checkDarkMode();
    const interval = setInterval(checkDarkMode, 300);
    return () => clearInterval(interval);
  }, []);

  const processData = (customersData: any[], loansData: any[], repaymentsData: any[]) => {
    // Calculate dashboard statistics
    const totalCustomers = customersData.length;
    const totalLoans = loansData.length;
    
    const totalDisbursed = loansData.reduce((sum, loan) => {
      if (loan.status?.toLowerCase() !== 'pending' && loan.status?.toLowerCase() !== 'rejected') {
        return sum + (loan.principalAmount || 0);
      }
      return sum;
    }, 0);

    const totalRepaid = repaymentsData.reduce((sum, payment) => 
      sum + (payment.paymentAmount || 0), 0);

    const outstandingBalance = loansData.reduce((sum, loan) => {
      if (loan.status?.toLowerCase() === 'active' || 
          loan.status?.toLowerCase() === 'disbursed' || 
          loan.status?.toLowerCase() === 'overdue') {
        return sum + (loan.remainingBalance || loan.outstandingBalance || 0);
      }
      return sum;
    }, 0);

    const activeLoans = loansData.filter(l => 
      l.status?.toLowerCase() === 'active' || l.status?.toLowerCase() === 'disbursed'
    ).length;

    const overdueLoans = loansData.filter(l => 
      l.status?.toLowerCase() === 'overdue'
    ).length;

    const completedLoans = loansData.filter(l => 
      l.status?.toLowerCase() === 'completed'
    ).length;

    const totalProfit = loansData.reduce((sum, loan) => 
      sum + (loan.interestAmount || 0), 0);

    const totalLoss = loansData.filter(l => 
      l.status?.toLowerCase() === 'defaulted'
    ).reduce((sum, loan) => sum + (loan.principalAmount || 0), 0);

    const monthlyTarget = 5000000;

    setDashboardData({
      totalCustomers,
      totalLoans,
      totalDisbursed,
      totalRepaid,
      outstandingBalance,
      overdueLoans,
      completedLoans,
      totalProfit,
      totalLoss,
      activeLoans,
      monthlyTarget
    });

    // Calculate monthly performance
    calculateMonthlyPerformance(loansData, repaymentsData);

    // Calculate product distribution
    calculateProductDistribution(loansData);

    // Calculate loan status distribution
    calculateLoanStatus(loansData);
  };

  const calculateMonthlyPerformance = (loansData: any[], repaymentsData: any[]) => {
    const monthsData: any = {};
    
    // Get last 8 months
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      monthsData[monthKey] = { month: monthKey, disbursed: 0, repaid: 0, customers: 0, loans: 0 };
    }

    // Add disbursed amounts
    loansData.forEach(loan => {
      if (loan.createdAt) {
        const date = new Date(loan.createdAt);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        if (monthsData[monthKey]) {
          monthsData[monthKey].disbursed += loan.principalAmount || 0;
          monthsData[monthKey].loans += 1;
        }
      }
    });

    // Add repaid amounts
    repaymentsData.forEach(payment => {
      if (payment.paymentDate) {
        const date = new Date(payment.paymentDate);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        if (monthsData[monthKey]) {
          monthsData[monthKey].repaid += payment.paymentAmount || 0;
        }
      }
    });

    // Add customers count
    customers.forEach(customer => {
      if (customer.createdAt) {
        const date = new Date(customer.createdAt);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        if (monthsData[monthKey]) {
          monthsData[monthKey].customers += 1;
        }
      }
    });

    setMonthlyPerformance(Object.values(monthsData));
  };

  const calculateProductDistribution = (loansData: any[]) => {
    const products: any = {
      Monthly: { name: 'Monthly', value: 0, amount: 0 },
      Weekly: { name: 'Weekly', value: 0, amount: 0 },
      Daily: { name: 'Daily', value: 0, amount: 0 }
    };

    loansData.forEach(loan => {
      const product = loan.loanProduct;
      if (products[product]) {
        products[product].value += 1;
        products[product].amount += loan.principalAmount || 0;
      }
    });

    setProductDistribution(Object.values(products).filter((p: any) => p.value > 0));
  };

  const calculateLoanStatus = (loansData: any[]) => {
    const statusCounts: any = {};
    const total = loansData.length || 1;

    loansData.forEach(loan => {
      const status = loan.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusArray = Object.entries(statusCounts).map(([status, count]: [string, any]) => ({
      status,
      count,
      percentage: ((count / total) * 100).toFixed(1)
    }));

    setLoanStatus(statusArray);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const handleExport = () => {
    // Create CSV export
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Customers', dashboardData?.totalCustomers || 0],
      ['Total Loans', dashboardData?.totalLoans || 0],
      ['Total Disbursed', dashboardData?.totalDisbursed || 0],
      ['Total Repaid', dashboardData?.totalRepaid || 0],
      ['Outstanding Balance', dashboardData?.outstandingBalance || 0],
      ['Active Loans', dashboardData?.activeLoans || 0],
      ['Overdue Loans', dashboardData?.overdueLoans || 0],
      ['Completed Loans', dashboardData?.completedLoans || 0]
    ];
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${
        isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-blue-50'
      }`}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-orange-500 mx-auto mb-4" />
          <p className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const totalTargetPercentage = dashboardData?.monthlyTarget && dashboardData?.totalDisbursed
    ? ((dashboardData.totalDisbursed / dashboardData.monthlyTarget) * 100).toFixed(0)
    : '0';

  const monthlyTargetAchieved = dashboardData?.totalDisbursed || 0;
  const monthlyTarget = dashboardData?.monthlyTarget || 5000000;
  const targetDifference = monthlyTargetAchieved - (monthlyTarget * 0.80);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-blue-50'
    }`}>
      {/* Header */}
      <div className={`border-b ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Dashboard
              </h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Welcome! Here's your business overview
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`p-2.5 border rounded-xl transition-colors disabled:opacity-50 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''} ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`} />
              </button>
              <button
                onClick={handleExport}
                className={`px-4 py-2.5 border rounded-xl transition-colors flex items-center gap-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Download className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Export
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Top Stats Row */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Disbursed */}
            <div className={`rounded-2xl p-6 border relative overflow-hidden ${
              isDarkMode 
                ? 'bg-gradient-to-br from-orange-900/30 to-orange-800/30 border-orange-700' 
                : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
            }`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-20 ${
                isDarkMode ? 'bg-orange-600' : 'bg-orange-200'
              }`}></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <span className="flex items-center text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    Active
                  </span>
                </div>
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-orange-300' : 'text-orange-700'
                }`}>Total Disbursed</p>
                <p className={`text-3xl font-bold ${
                  isDarkMode ? 'text-orange-100' : 'text-orange-900'
                }`}>{formatCurrency(dashboardData.totalDisbursed)}</p>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                }`}>{formatNumber(dashboardData.totalLoans)} loans</p>
              </div>
            </div>

            {/* Total Loans */}
            <div className={`rounded-2xl p-6 border shadow-sm relative overflow-hidden ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-20 ${
                isDarkMode ? 'bg-blue-600' : 'bg-blue-100'
              }`}></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <span className="flex items-center text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full">
                    {dashboardData.activeLoans} Active
                  </span>
                </div>
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Total Loans</p>
                <p className={`text-3xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{formatNumber(dashboardData.totalLoans)}</p>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>{formatNumber(dashboardData.completedLoans)} completed</p>
              </div>
            </div>

            {/* Total Customers */}
            <div className={`rounded-2xl p-6 border shadow-sm relative overflow-hidden ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -mr-16 -mt-16 opacity-20"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <span className="flex items-center text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    Growing
                  </span>
                </div>
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Total Customers</p>
                <p className={`text-3xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{formatNumber(dashboardData.totalCustomers)}</p>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>Registered users</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Analytics - Takes 2 columns */}
          <div className={`lg:col-span-2 rounded-2xl p-6 border shadow-sm ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Revenue Analytics</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-orange-500"></div>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Disbursed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-orange-300"></div>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Repaid</span>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-orange-500 text-white text-xs rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center gap-2">
                {selectedPeriod}
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>

            {monthlyPerformance.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyPerformance}>
                    <defs>
                      <linearGradient id="colorDisbursed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRepaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FDB462" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#FDB462" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#f0f0f0'} vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke={isDarkMode ? '#6B7280' : '#9CA3AF'}
                      style={{ fontSize: '11px' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke={isDarkMode ? '#6B7280' : '#9CA3AF'}
                      style={{ fontSize: '11px' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `₦${(value / 1000)}k`}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1F2937' : '#fff', 
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        color: isDarkMode ? '#fff' : '#000'
                      }}
                      formatter={(value: any) => [formatCurrency(value), '']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="disbursed" 
                      stroke="#FF6B35" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorDisbursed)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="repaid" 
                      stroke="#FDB462" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRepaid)"
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>

                <div className={`mt-4 p-4 rounded-xl ${
                  isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Latest Disbursed</p>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(monthlyPerformance[monthlyPerformance.length - 1]?.disbursed || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Latest Repaid</p>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(monthlyPerformance[monthlyPerformance.length - 1]?.repaid || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart3 className={`w-12 h-12 mx-auto mb-2 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-300'
                  }`} />
                  <p className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>No revenue data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Target - 1 column */}
          <div className={`rounded-2xl p-6 border shadow-sm ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Monthly Target</h3>
              <button className={`p-1.5 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}>
                <MoreVertical className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className="flex items-center justify-center my-6">
              <div className="relative w-44 h-44">
                <svg className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <circle
                    cx="88"
                    cy="88"
                    r="70"
                    stroke={isDarkMode ? '#374151' : '#FEF3C7'}
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="70"
                    stroke="url(#targetGradient)"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - (parseFloat(totalTargetPercentage as string) / 100))}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="targetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF6B35" />
                      <stop offset="100%" stopColor="#F7931E" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{totalTargetPercentage}%</p>
                  <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Of target</p>
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className={`text-sm font-semibold mb-1 ${
                isDarkMode ? 'text-orange-400' : 'text-orange-600'
              }`}>
                {parseFloat(totalTargetPercentage) >= 80 ? 'Great Progress! 🎉' : 'Keep Going! 💪'}
              </p>
              <p className={`text-xs leading-relaxed ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {parseFloat(totalTargetPercentage) >= 80 
                  ? `You're ${formatCurrency(Math.max(0, targetDifference))} above 80% target!`
                  : `${formatCurrency(monthlyTarget - monthlyTargetAchieved)} more to reach target`
                }
              </p>
            </div>

            <div className={`rounded-xl p-4 space-y-2.5 ${
              isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Target</span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(monthlyTarget)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Achieved</span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{formatCurrency(monthlyTargetAchieved)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Active Loans */}
          <div className={`rounded-2xl p-6 border shadow-sm ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Active Loans</h3>
              <button className={`p-1 rounded transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}>
                <MoreVertical className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className="mb-4">
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(dashboardData?.activeLoans || 0)}</p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Currently active</p>
            </div>

            {loanStatus.length > 0 && (
              <div className="space-y-3">
                {loanStatus.slice(0, 3).map((status: any, idx: number) => {
                  const statusPercentage = parseFloat(status?.percentage || '0');
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{status?.status || 'Unknown'}</span>
                        <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{statusPercentage.toFixed(0)}%</span>
                      </div>
                      <div className={`w-full rounded-full h-1.5 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-orange-100'
                      }`}>
                        <div
                          className="bg-orange-500 h-1.5 rounded-full"
                          style={{ width: `${statusPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Loan Status Distribution - Takes 2 columns */}
          <div className={`lg:col-span-2 rounded-2xl p-6 border shadow-sm ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loan Status</h3>
            </div>

            {loanStatus.length > 0 ? (
              <>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {loanStatus.slice(0, 4).map((status: any, idx: number) => (
                    <div key={idx} className="text-center">
                      <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{status.status}</p>
                      <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatNumber(status?.count || 0)}</p>
                      <p className={`text-xs font-medium ${
                        idx === 0 ? 'text-green-600' : 
                        idx === 1 ? 'text-blue-600' : 
                        idx === 2 ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        {status?.percentage || 0}%
                      </p>
                    </div>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={loanStatus.slice(0, 4)}>
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {loanStatus.slice(0, 4).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>No loan status data available</p>
              </div>
            )}
          </div>

          {/* Product Distribution */}
          <div className={`rounded-2xl p-6 border shadow-sm ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Products</h3>
            </div>

            {productDistribution.length > 0 ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      {productDistribution.map((product: any, idx: number) => {
                        const total = productDistribution.reduce((sum: number, p: any) => sum + p.value, 0);
                        const percentage = (product.value / total) * 100;
                        const circumference = 2 * Math.PI * 50;
                        const offset = circumference - (percentage / 100) * circumference;
                        const prevPercentages = productDistribution.slice(0, idx).reduce((sum: number, p: any) => sum + (p.value / total) * 100, 0);
                        const rotation = (prevPercentages / 100) * circumference;

                        return (
                          <circle
                            key={idx}
                            cx="64"
                            cy="64"
                            r="50"
                            stroke={COLORS[idx]}
                            strokeWidth="20"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{ 
                              strokeDashoffset: rotation + offset,
                              transition: 'all 0.3s ease'
                            }}
                          />
                        );
                      })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatNumber(productDistribution.reduce((sum: number, p: any) => sum + (p.value || 0), 0))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {productDistribution.map((product: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[idx] }}></div>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{product.name || 'Unknown'}</span>
                      </div>
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(product.amount || 0)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>No product data</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className={`rounded-2xl p-6 border ${
              isDarkMode 
                ? 'bg-blue-900/20 border-blue-800' 
                : 'bg-blue-50 border-blue-100'
            }`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Completed</span>
            </div>
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>{dashboardData?.completedLoans || 0}</p>
            <p className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mt-1`}>Loans closed</p>
          </div>

          <div className={`rounded-2xl p-6 border ${
            isDarkMode 
                ? 'bg-green-900/20 border-green-800' 
                : 'bg-green-50 border-green-100'
            }`}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Repaid</span>
            </div>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-200' : 'text-green-900'}`}>{formatCurrency(dashboardData?.totalRepaid || 0)}</p>
            <p className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'} mt-1`}>Total collections</p>
          </div>

          <div className={`rounded-2xl p-6 border ${
            isDarkMode 
              ? 'bg-orange-900/20 border-orange-800' 
              : 'bg-orange-50 border-orange-100'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>Outstanding</span>
            </div>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-orange-200' : 'text-orange-900'}`}>{formatCurrency(dashboardData?.outstandingBalance || 0)}</p>
            <p className={`text-xs ${isDarkMode ? 'text-orange-400' : 'text-orange-600'} mt-1`}>Balance due</p>
          </div>

          <div className={`rounded-2xl p-6 border ${
            isDarkMode 
              ? 'bg-red-900/20 border-red-800' 
              : 'bg-red-50 border-red-100'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Overdue</span>
            </div>
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-red-200' : 'text-red-900'}`}>{dashboardData?.overdueLoans || 0}</p>
            <p className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-600'} mt-1`}>Needs attention</p>
          </div>
        </div>

        {/* Performance Trends */}
        {monthlyPerformance.length > 0 && (
          <div className={`rounded-2xl p-6 border shadow-sm mt-6 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Growth Trends</h3>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Customer and loan progression</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '11px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#9CA3AF" 
                  style={{ fontSize: '11px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#9CA3AF" 
                  style={{ fontSize: '11px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="customers" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', r: 4 }}
                  name="Customers"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="loans" 
                  stroke="#FF6B35" 
                  strokeWidth={3}
                  dot={{ fill: '#FF6B35', r: 4 }}
                  name="Loans"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}