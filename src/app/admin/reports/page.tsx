"use client";

import React, { useState, useEffect } from 'react';
import {
  Download, Calendar, Filter, TrendingUp, TrendingDown, 
  DollarSign, Users, FileText, Loader2, RefreshCw,
  BarChart3, PieChart, Activity, AlertCircle, CheckCircle,
  Clock, XCircle, ChevronDown, Search, Wallet
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';

// const API_URL = 'http://localhost:5000/api';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API Services - Same as used in customer, loan, and repayment pages
const reportService = {
  getAllCustomers: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch customers');
    const response = await res.json();
    return response.data || response;
  },

  getAllLoans: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/loans`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch loans');
    const response = await res.json();
    return response.data || response;
  },

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

export default function ReportsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [customers, setCustomers] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [repayments, setRepayments] = useState<any[]>([]);
  
  // Report states
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Processed data
  const [reportData, setReportData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [productPerformance, setProductPerformance] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);

  // Dark mode detection
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

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (customers.length > 0 || loans.length > 0 || repayments.length > 0) {
      processReportData();
    }
  }, [customers, loans, repayments, dateRange]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [customersData, loansData, repaymentsData] = await Promise.all([
        reportService.getAllCustomers(),
        reportService.getAllLoans(),
        reportService.getAllRepayments()
      ]);

      setCustomers(Array.isArray(customersData) ? customersData : []);
      setLoans(Array.isArray(loansData) ? loansData : []);
      setRepayments(Array.isArray(repaymentsData) ? repaymentsData : []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setCustomers([]);
      setLoans([]);
      setRepayments([]);
    } finally {
      setLoading(false);
    }
  };

  const processReportData = () => {
    // Filter data by date range
    const filteredLoans = filterByDateRange(loans);
    const filteredRepayments = filterByDateRange(repayments);
    const filteredCustomers = filterByDateRange(customers);

    // Calculate overview metrics
    const totalDisbursed = filteredLoans.reduce((sum, loan) => {
      if (loan.status?.toLowerCase() !== 'pending' && loan.status?.toLowerCase() !== 'rejected') {
        return sum + (loan.principalAmount || 0);
      }
      return sum;
    }, 0);

    const totalRepaid = filteredRepayments.reduce((sum, payment) => 
      sum + (payment.paymentAmount || 0), 0);

    const totalInterest = filteredLoans.reduce((sum, loan) => 
      sum + (loan.interestAmount || 0), 0);

    const outstandingBalance = filteredLoans.reduce((sum, loan) => {
      if (loan.status?.toLowerCase() === 'active' || 
          loan.status?.toLowerCase() === 'disbursed' || 
          loan.status?.toLowerCase() === 'overdue') {
        return sum + (loan.remainingBalance || loan.outstandingBalance || 0);
      }
      return sum;
    }, 0);

    const activeLoans = filteredLoans.filter(l => 
      l.status?.toLowerCase() === 'active' || l.status?.toLowerCase() === 'disbursed'
    ).length;

    const overdueLoans = filteredLoans.filter(l => 
      l.status?.toLowerCase() === 'overdue'
    ).length;

    const completedLoans = filteredLoans.filter(l => 
      l.status?.toLowerCase() === 'completed'
    ).length;

    const collectionRate = totalDisbursed > 0 
      ? ((totalRepaid / totalDisbursed) * 100).toFixed(1)
      : '0';

    const defaultRate = filteredLoans.length > 0
      ? ((filteredLoans.filter(l => l.status?.toLowerCase() === 'defaulted').length / filteredLoans.length) * 100).toFixed(1)
      : '0';

    setReportData({
      totalCustomers: filteredCustomers.length,
      totalLoans: filteredLoans.length,
      totalDisbursed,
      totalRepaid,
      totalInterest,
      outstandingBalance,
      activeLoans,
      overdueLoans,
      completedLoans,
      collectionRate,
      defaultRate,
      averageLoanSize: filteredLoans.length > 0 ? totalDisbursed / filteredLoans.length : 0,
      totalProfit: totalInterest
    });

    // Calculate monthly trends
    calculateMonthlyTrends(filteredLoans, filteredRepayments);
    
    // Calculate status distribution
    calculateStatusDistribution(filteredLoans);
    
    // Calculate product performance
    calculateProductPerformance(filteredLoans);
    
    // Calculate top customers
    calculateTopCustomers(filteredCustomers, filteredLoans);
  };

  const filterByDateRange = (data: any[]) => {
    if (dateRange === 'all') return data;

    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }

    return data.filter(item => {
      const itemDate = new Date(item.createdAt || item.paymentDate);
      return itemDate >= startDate;
    });
  };

  const calculateMonthlyTrends = (loansData: any[], repaymentsData: any[]) => {
    const monthsData: any = {};
    
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      monthsData[monthKey] = { 
        month: monthKey, 
        disbursed: 0, 
        repaid: 0, 
        loans: 0,
        customers: 0
      };
    }

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

    repaymentsData.forEach(payment => {
      if (payment.paymentDate) {
        const date = new Date(payment.paymentDate);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        if (monthsData[monthKey]) {
          monthsData[monthKey].repaid += payment.paymentAmount || 0;
        }
      }
    });

    setMonthlyData(Object.values(monthsData));
  };

  const calculateStatusDistribution = (loansData: any[]) => {
    const statusCounts: any = {};
    
    loansData.forEach(loan => {
      const status = loan.status || 'Unknown';
      if (!statusCounts[status]) {
        statusCounts[status] = { name: status, value: 0, amount: 0 };
      }
      statusCounts[status].value += 1;
      statusCounts[status].amount += loan.principalAmount || 0;
    });

    setStatusDistribution(Object.values(statusCounts));
  };

  const calculateProductPerformance = (loansData: any[]) => {
    const products: any = {
      Monthly: { name: 'Monthly', loans: 0, amount: 0, interest: 0 },
      Weekly: { name: 'Weekly', loans: 0, amount: 0, interest: 0 },
      Daily: { name: 'Daily', loans: 0, amount: 0, interest: 0 }
    };

    loansData.forEach(loan => {
      const product = loan.loanProduct;
      if (products[product]) {
        products[product].loans += 1;
        products[product].amount += loan.principalAmount || 0;
        products[product].interest += loan.interestAmount || 0;
      }
    });

    setProductPerformance(Object.values(products).filter((p: any) => p.loans > 0));
  };

  const calculateTopCustomers = (customersData: any[], loansData: any[]) => {
    const customerLoans: any = {};

    loansData.forEach(loan => {
      const customerId = loan.customerId || loan.customer_id;
      if (!customerLoans[customerId]) {
        const customer = customersData.find(c => c.id === customerId);
        customerLoans[customerId] = {
          id: customerId,
          name: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
          totalBorrowed: 0,
          totalRepaid: 0,
          loansCount: 0
        };
      }
      customerLoans[customerId].totalBorrowed += loan.principalAmount || 0;
      customerLoans[customerId].loansCount += 1;
    });

    const topCustomersList = Object.values(customerLoans)
      .sort((a: any, b: any) => b.totalBorrowed - a.totalBorrowed)
      .slice(0, 10);

    setTopCustomers(topCustomersList);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const handleExportReport = () => {
    let csvData = '';
    
    if (reportType === 'overview') {
      csvData = generateOverviewCSV();
    } else if (reportType === 'loans') {
      csvData = generateLoansCSV();
    } else if (reportType === 'repayments') {
      csvData = generateRepaymentsCSV();
    } else if (reportType === 'customers') {
      csvData = generateCustomersCSV();
    }

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateOverviewCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Customers', reportData?.totalCustomers || 0],
      ['Total Loans', reportData?.totalLoans || 0],
      ['Total Disbursed', reportData?.totalDisbursed || 0],
      ['Total Repaid', reportData?.totalRepaid || 0],
      ['Total Interest', reportData?.totalInterest || 0],
      ['Outstanding Balance', reportData?.outstandingBalance || 0],
      ['Active Loans', reportData?.activeLoans || 0],
      ['Overdue Loans', reportData?.overdueLoans || 0],
      ['Completed Loans', reportData?.completedLoans || 0],
      ['Collection Rate (%)', reportData?.collectionRate || 0],
      ['Default Rate (%)', reportData?.defaultRate || 0],
      ['Average Loan Size', reportData?.averageLoanSize || 0]
    ];
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateLoansCSV = () => {
    const headers = [
      'Loan ID', 'Customer Name', 'Product', 'Principal Amount', 
      'Interest Amount', 'Total Amount', 'Status', 'Disbursement Date'
    ];
    
    const rows = loans.map(loan => {
      const customer = customers.find(c => c.id === (loan.customerId || loan.customer_id));
      return [
        loan.id || '',
        customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
        loan.loanProduct || '',
        loan.principalAmount || 0,
        loan.interestAmount || 0,
        loan.totalAmount || 0,
        loan.status || '',
        loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : ''
      ];
    });
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateRepaymentsCSV = () => {
    const headers = [
      'Payment ID', 'Loan ID', 'Payment Amount', 'Payment Date', 
      'Payment Method', 'Status'
    ];
    
    const rows = repayments.map(payment => [
      payment.id || '',
      payment.loanId || payment.loan_id || '',
      payment.paymentAmount || 0,
      payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '',
      payment.paymentMethod || '',
      payment.status || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateCustomersCSV = () => {
    const headers = [
      'Customer ID', 'Name', 'Email', 'Phone', 'Total Loans', 
      'Total Borrowed', 'Registration Date'
    ];
    
    const rows = customers.map(customer => {
      const customerLoans = loans.filter(l => 
        (l.customerId || l.customer_id) === customer.id
      );
      const totalBorrowed = customerLoans.reduce((sum, l) => 
        sum + (l.principalAmount || 0), 0
      );
      
      return [
        customer.id || '',
        `${customer.firstName || ''} ${customer.lastName || ''}`,
        customer.email || '',
        customer.phoneNumber || '',
        customerLoans.length,
        totalBorrowed,
        customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : ''
      ];
    });
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
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
            Loading Reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-blue-50'
    }`}>
      {/* Header */}
      <div className={`border-b ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Reports & Analytics
              </h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Comprehensive business insights and reports
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
                onClick={handleExportReport}
                className="px-4 py-2.5 bg-orange-500 text-white rounded-xl transition-colors hover:bg-orange-600 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export Report</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Report Type */}
            <div className="relative">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className={`pl-4 pr-10 py-2.5 border rounded-xl text-sm font-medium appearance-none cursor-pointer ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <option value="overview">Overview Report</option>
                <option value="loans">Loans Report</option>
                <option value="repayments">Repayments Report</option>
                <option value="customers">Customers Report</option>
              </select>
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>

            {/* Date Range */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`pl-4 pr-10 py-2.5 border rounded-xl text-sm font-medium appearance-none cursor-pointer ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
              <Calendar className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Overview Report */}
        {reportType === 'overview' && reportData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className={`rounded-2xl p-6 border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Customers
                </p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(reportData.totalCustomers)}
                </p>
              </div>

              <div className={`rounded-2xl p-6 border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Wallet className="w-6 h-6 text-green-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Loans
                </p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(reportData.totalLoans)}
                </p>
              </div>

              <div className={`rounded-2xl p-6 border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Disbursed
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(reportData.totalDisbursed)}
                </p>
              </div>

              <div className={`rounded-2xl p-6 border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {reportData.collectionRate}%
                  </span>
                </div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Collection Rate
                </p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {reportData.collectionRate}%
                </p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Trends */}
              <div className={`rounded-2xl p-6 border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Monthly Trends
                    </h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Disbursement vs Repayment
                    </p>
                  </div>
                  <BarChart3 className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>

                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorDisbursed2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRepaid2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#f0f0f0'} />
                      <XAxis 
                        dataKey="month" 
                        stroke={isDarkMode ? '#6B7280' : '#9CA3AF'}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke={isDarkMode ? '#6B7280' : '#9CA3AF'}
                        style={{ fontSize: '12px' }}
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
                        fill="url(#colorDisbursed2)"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="repaid" 
                        stroke="#4ECDC4" 
                        strokeWidth={2}
                        fill="url(#colorRepaid2)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                      No data available
                    </p>
                  </div>
                )}
              </div>

              {/* Status Distribution */}
              <div className={`rounded-2xl p-6 border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Loan Status Distribution
                    </h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Portfolio breakdown
                    </p>
                  </div>
                  <PieChart className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>

                {statusDistribution.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <RePieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: isDarkMode ? '#1F2937' : '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            color: isDarkMode ? '#fff' : '#000'
                          }}
                        />
                      </RePieChart>
                    </ResponsiveContainer>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {statusDistribution.map((status, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {status.name}
                            </p>
                            <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {status.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                      No data available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`rounded-2xl p-6 border ${
                isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                    Total Repaid
                  </span>
                </div>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-green-100' : 'text-green-900'}`}>
                  {formatCurrency(reportData.totalRepaid)}
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Collections to date
                </p>
              </div>

              <div className={`rounded-2xl p-6 border ${
                isDarkMode ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                    Outstanding
                  </span>
                </div>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-orange-100' : 'text-orange-900'}`}>
                  {formatCurrency(reportData.outstandingBalance)}
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  Balance due
                </p>
              </div>

              <div className={`rounded-2xl p-6 border ${
                isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Total Interest
                  </span>
                </div>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-blue-100' : 'text-blue-900'}`}>
                  {formatCurrency(reportData.totalInterest)}
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Revenue earned
                </p>
              </div>
            </div>

            {/* Product Performance */}
            {productPerformance.length > 0 && (
              <div className={`rounded-2xl p-6 border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Product Performance
                    </h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Loan products breakdown
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {productPerformance.map((product, index) => (
                    <div key={index} className={`p-4 rounded-xl border ${
                      isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {product.name}
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {product.loans} loans
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(product.amount)}
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            +{formatCurrency(product.interest)} interest
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Loans Report */}
        {reportType === 'loans' && (
          <div className={`rounded-2xl p-6 border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Loans Report
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Loan ID</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Customer</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Product</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Amount</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.slice(0, 10).map((loan, index) => {
                    const customer = customers.find(c => c.id === (loan.customerId || loan.customer_id));
                    return (
                      <tr key={index} className={`border-b ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-100'
                      }`}>
                        <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {loan.id}
                        </td>
                        <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown'}
                        </td>
                        <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {loan.loanProduct}
                        </td>
                        <td className={`py-3 px-4 text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatCurrency(loan.principalAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            loan.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-700' :
                            loan.status?.toLowerCase() === 'completed' ? 'bg-blue-100 text-blue-700' :
                            loan.status?.toLowerCase() === 'overdue' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {loan.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Repayments Report */}
        {reportType === 'repayments' && (
          <div className={`rounded-2xl p-6 border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Repayments Report
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Payment ID</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Loan ID</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Amount</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Date</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {repayments.slice(0, 10).map((payment, index) => (
                    <tr key={index} className={`border-b ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {payment.id}
                      </td>
                      <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {payment.loanId || payment.loan_id}
                      </td>
                      <td className={`py-3 px-4 text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(payment.paymentAmount)}
                      </td>
                      <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {payment.paymentMethod || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customers Report */}
        {reportType === 'customers' && topCustomers.length > 0 && (
          <div className={`rounded-2xl p-6 border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Top Customers Report
            </h3>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={index} className={`p-4 rounded-xl border ${
                  isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {customer.name}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {customer.loansCount} loans
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(customer.totalBorrowed)}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total borrowed
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Customers Table for Customers Report */}
        {reportType === 'customers' && customers.length > 0 && (
          <div className={`rounded-2xl p-6 border mt-6 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              All Customers
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Customer ID</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Name</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Email</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Phone</th>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Total Loans</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.slice(0, 20).map((customer, index) => {
                    const customerLoans = loans.filter(l => 
                      (l.customerId || l.customer_id) === customer.id
                    );
                    return (
                      <tr key={index} className={`border-b ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-100'
                      }`}>
                        <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {customer.id}
                        </td>
                        <td className={`py-3 px-4 text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {customer.firstName} {customer.lastName}
                        </td>
                        <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {customer.email}
                        </td>
                        <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {customer.phoneNumber}
                        </td>
                        <td className={`py-3 px-4 text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {customerLoans.length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loan Performance Details */}
        {reportType === 'overview' && reportData && (
          <div className={`rounded-2xl p-6 border mt-6 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Loan Performance Metrics
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Detailed breakdown of portfolio health
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl border ${
                isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Active Loans
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-100' : 'text-blue-900'}`}>
                  {formatNumber(reportData.activeLoans)}
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${
                isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                    Completed
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-100' : 'text-green-900'}`}>
                  {formatNumber(reportData.completedLoans)}
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${
                isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                    Overdue
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-100' : 'text-red-900'}`}>
                  {formatNumber(reportData.overdueLoans)}
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${
                isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Avg Loan Size
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-100' : 'text-purple-900'}`}>
                  {formatCurrency(reportData.averageLoanSize)}
                </p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className={`mt-6 p-4 rounded-xl ${
              isDarkMode ? 'bg-gradient-to-r from-orange-900/30 to-red-900/30' : 'bg-gradient-to-r from-orange-50 to-red-50'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Default Rate
                  </p>
                  <p className={`text-3xl font-bold ${
                    parseFloat(reportData.defaultRate) > 5 
                      ? 'text-red-600' 
                      : isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {reportData.defaultRate}%
                  </p>
                </div>
                <div>
                  <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Total Profit
                  </p>
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {formatCurrency(reportData.totalProfit)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}