"use client";

import { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Wallet, DollarSign, AlertCircle, CheckCircle, BarChart3, PieChart, FileText, ArrowUpRight, ArrowDownRight, MoreVertical, Download, Printer, AlertTriangle, Activity, Target, Bell, ChevronRight, Calendar, CreditCard, Zap } from 'lucide-react';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('month');

  // Core Statistics
  const stats = {
    totalCustomers: 1247,
    activeCustomers: 1089,
    totalLoans: 856,
    activeLoans: 210,
    totalDisbursed: 45680000,
    totalRepaid: 32450000,
    outstanding: 13230000,
    overdueLoans: 23,
    pendingApprovals: 15,
    approvedLoans: 45,
    completedLoans: 623,
    defaultedLoans: 8,
    totalProfit: 8920000,
    totalLoss: 450000,
    collectionRate: 92.5,
    portfolioAtRisk: 5.2,
    profitMargin: 19.5,
    lossRate: 0.98
  };

  // Monthly Performance Data
  const monthlyData = [
    { month: 'Jan', disbursed: 3500000, repaid: 2800000, profit: 650000, loans: 68, overdue: 3, outstanding: 700000 },
    { month: 'Feb', disbursed: 4200000, repaid: 3100000, profit: 720000, loans: 75, overdue: 5, outstanding: 1100000 },
    { month: 'Mar', disbursed: 3800000, repaid: 3400000, profit: 810000, loans: 71, overdue: 2, outstanding: 400000 },
    { month: 'Apr', disbursed: 4500000, repaid: 3800000, profit: 920000, loans: 82, overdue: 4, outstanding: 700000 },
    { month: 'May', disbursed: 4100000, repaid: 3600000, profit: 780000, loans: 78, overdue: 6, outstanding: 500000 },
    { month: 'Jun', disbursed: 4800000, repaid: 4200000, profit: 950000, loans: 89, overdue: 3, outstanding: 600000 }
  ];

  // Product Distribution with Interest Rates
  const productDistribution = [
    { 
      name: 'Monthly Loans', 
      value: 45, 
      amount: 18500000, 
      count: 385, 
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      rate: 25,
      tenure: 'Up to 6 months',
      type: 'Individual'
    },
    { 
      name: 'Weekly Loans', 
      value: 35, 
      amount: 15200000, 
      count: 300, 
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
      rate: 27,
      tenure: 'Up to 24 weeks',
      type: 'Group'
    },
    { 
      name: 'Daily Loans', 
      value: 20, 
      amount: 11980000, 
      count: 171, 
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600',
      rate: 18,
      tenure: 'Max 20 days',
      type: 'Individual/Group'
    }
  ];

  // Loan Status Distribution
  const loanStatusData = [
    { status: 'Active', count: stats.activeLoans, color: 'bg-blue-500', percentage: 24.5 },
    { status: 'Completed', count: stats.completedLoans, color: 'bg-green-500', percentage: 72.8 },
    { status: 'Overdue', count: stats.overdueLoans, color: 'bg-red-500', percentage: 2.7 },
    { status: 'Pending', count: stats.pendingApprovals, color: 'bg-yellow-500', percentage: 1.8 }
  ];

  // Recent Loans
  const recentLoans = [
    { id: 'LN-2024-001', customerName: 'Adebayo Oluwaseun', loanType: 'Monthly', amount: 250000, status: 'pending', date: '2024-12-01', officer: 'John Doe', tenure: '6 months' },
    { id: 'LN-2024-002', customerName: 'Chioma Nwankwo', loanType: 'Weekly', amount: 150000, status: 'approved', date: '2024-12-01', officer: 'Jane Smith', tenure: '20 weeks' },
    { id: 'LN-2024-003', customerName: 'Ibrahim Musa', loanType: 'Daily', amount: 50000, status: 'active', date: '2024-11-30', officer: 'John Doe', tenure: '15 days' },
    { id: 'LN-2024-004', customerName: 'Blessing Okafor', loanType: 'Monthly', amount: 300000, status: 'overdue', date: '2024-11-28', officer: 'Mary Johnson', tenure: '4 months' },
    { id: 'LN-2024-005', customerName: 'Yusuf Abdullahi', loanType: 'Weekly', amount: 180000, status: 'pending', date: '2024-11-30', officer: 'Jane Smith', tenure: '16 weeks' }
  ];

  // Overdue Alerts
  const overdueAlerts = [
    { customer: 'Blessing Okafor', loanId: 'LN-2024-004', amount: 300000, daysOverdue: 12, expected: 125000, principal: 300000, interest: 75000 },
    { customer: 'Emeka Obi', loanId: 'LN-2024-023', amount: 150000, daysOverdue: 8, expected: 75000, principal: 150000, interest: 40500 },
    { customer: 'Fatima Ahmed', loanId: 'LN-2024-067', amount: 200000, daysOverdue: 5, expected: 50000, principal: 200000, interest: 36000 }
  ];

  // Officer Performance
  const officerPerformance = [
    { name: 'John Doe', loans: 145, disbursed: 8500000, collected: 7200000, rate: 94.2, overdue: 3, customers: 89 },
    { name: 'Jane Smith', loans: 132, disbursed: 7800000, collected: 6900000, rate: 91.8, overdue: 5, customers: 78 },
    { name: 'Mary Johnson', loans: 98, disbursed: 5600000, collected: 5100000, rate: 89.5, overdue: 7, customers: 62 },
    { name: 'David Brown', loans: 87, disbursed: 4900000, collected: 4500000, rate: 93.1, overdue: 4, customers: 54 }
  ];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, subtitle, badge }: { title: string; value: string; icon: React.ComponentType<any>; trend?: string; trendValue?: string; color: string; subtitle?: string; badge?: string }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gray-50 to-transparent rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-500" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-semibold text-gray-600">{title}</p>
            </div>
            <h3 className="text-[1.6rem] font-bold text-gray-900 mb-1">{value}</h3>
            {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
          </div>
          <div className={`${color} p-2 rounded-2xl shadow-lg`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
        {trend && trendValue && (
          <div className="flex items-center pt-3 border-t border-gray-100">
            {trend === 'up' ? (
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span className="text-sm font-bold">{trendValue}</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                <span className="text-sm font-bold">{trendValue}</span>
              </div>
            )}
            <span className="text-xs text-gray-500 ml-2">vs last {timeRange}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen w-full p-2">
      <div className="mx-auto">
        
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <span className="px-2 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full shadow-lg animate-pulse">
                  ● Live
                </span>
              </div>
              <p className="text-gray-700 font-semibold text-lg">God's Will Empowerment Initiative</p>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Last updated: {new Date().toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-md cursor-pointer transition-all"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group">
                <Download className="w-4 h-4 group-hover:animate-bounce" />
                Export Report
              </button>
              <button className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-md flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>

          {/* Critical Alerts */}
          {stats.overdueLoans > 0 && (
            <div className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border-l-4 border-red-500 rounded-2xl p-5 shadow-lg animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <AlertTriangle className="w-7 h-7 text-red-600" />
                  </div>
                  <div>
                    <p className="font-bold text-red-900 text-lg">⚠️ Attention Required: {stats.overdueLoans} Overdue Loans</p>
                    <p className="text-sm text-red-700 font-medium">Total overdue amount: {formatCurrency(stats.outstanding * 0.15)} • Immediate action needed</p>
                  </div>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-md text-sm">
                  Review Now →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary KPI Cards - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers.toLocaleString()}
            subtitle={`${stats.activeCustomers} active customers`}
            icon={Users}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            trend="up"
            trendValue="+12.5%"
            badge={undefined}
          />
          <StatCard
            title="Total Loans"
            value={stats.totalLoans.toLocaleString()}
            subtitle={`${stats.activeLoans} active • ${stats.completedLoans} completed`}
            icon={Wallet}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            trend="up"
            trendValue="+8.3%"
            badge={undefined}
          />
          <StatCard
            title="Total Disbursed"
            value={formatCurrency(stats.totalDisbursed)}
            subtitle="Total capital deployed"
            icon={DollarSign}
            color="bg-gradient-to-br from-green-500 to-green-600"
            trend="up"
            trendValue="+15.2%"
            badge={undefined}
          />
          <StatCard
            title="Outstanding Balance"
            value={formatCurrency(stats.outstanding)}
            subtitle={`${stats.collectionRate}% collection rate`}
            icon={Activity}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            trend="down"
            trendValue="-3.1%"
            badge="PAR: 5.2%"
          />
        </div>

        {/* Financial Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Total Profit</p>
                <p className="text-[1.6rem] font-bold text-green-600">{formatCurrency(stats.totalProfit)}</p>
              </div>
              <div className="p-1 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Profit Margin</span>
                <span className="font-bold text-green-600">{stats.profitMargin}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Interest Earned</span>
                <span className="font-bold text-gray-900">{formatCurrency(stats.totalProfit)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Total Loss</p>
                <p className="text-[1.6rem] font-bold text-red-600">{formatCurrency(stats.totalLoss)}</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Loss Rate</span>
                <span className="font-bold text-gray-900">{stats.lossRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Defaulted</span>
                <span className="font-bold text-red-600">{stats.defaultedLoans} loans</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Collection Rate</p>
                <p className="text-[1.6rem] font-bold text-blue-600">{stats.collectionRate}%</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Target className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all shadow-inner" 
                  style={{ width: `${stats.collectionRate}%` }} 
                />
              </div>
              <p className="text-xs text-gray-600 font-medium text-center">Industry Target: 95%</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Portfolio at Risk</p>
                <p className="text-[1.6rem] font-bold text-orange-600">{stats.portfolioAtRisk}%</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Industry Avg</span>
                <span className="font-bold text-gray-900">7.2%</span>
              </div>
              <p className="text-xs text-green-600 font-semibold">✓ Below industry average</p>
            </div>
          </div>
        </div>

        {/* Loan Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Loan Status Distribution</h3>
              <p className="text-sm text-gray-600 mt-1">Current portfolio breakdown by status</p>
            </div>
            <BarChart3 className="w-6 h-6 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {loanStatusData.map((item, index) => (
              <div key={index} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-3 h-3 ${item.color} rounded-full shadow-sm`} />
                  <span className="text-sm font-bold text-gray-900">{item.percentage}%</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{item.count}</p>
                <p className="text-sm text-gray-600 font-medium">{item.status} Loans</p>
                <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`${item.color} h-2 rounded-full transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Monthly Performance Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Monthly Performance Analysis</h3>
                <p className="text-sm text-gray-600 mt-1">Disbursement vs Repayment Trends with Outstanding</p>
              </div>
              <BarChart3 className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-6">
              {monthlyData.map((data, index) => {
                const maxValue = Math.max(...monthlyData.map(d => d.disbursed));
                const repaymentRate = ((data.repaid / data.disbursed) * 100).toFixed(1);
                const profitMargin = ((data.profit / data.disbursed) * 100).toFixed(1);
                return (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800 w-12">{data.month}</span>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-blue-600" />
                          <span className="text-gray-600 font-medium">{data.loans} loans</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${data.overdue > 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {data.overdue} overdue
                        </span>
                        <span className="text-blue-600 font-bold">{repaymentRate}%</span>
                        <span className="text-green-600 font-bold">+{profitMargin}% profit</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl h-12 flex items-center justify-between px-4 transition-all hover:shadow-lg relative overflow-hidden group"
                        style={{ width: `${(data.disbursed / maxValue) * 100}%` }}
                      >
                        <span className="text-xs font-bold text-white">Disbursed</span>
                        <span className="text-xs font-bold text-white">{formatCurrency(data.disbursed)}</span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                      </div>
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl h-12 flex items-center justify-between px-4 transition-all hover:shadow-lg relative overflow-hidden group"
                        style={{ width: `${(data.repaid / maxValue) * 100}%` }}
                      >
                        <span className="text-xs font-bold text-white">Repaid</span>
                        <span className="text-xs font-bold text-white">{formatCurrency(data.repaid)}</span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                      </div>
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl h-10 flex items-center justify-between px-4 transition-all hover:shadow-lg relative overflow-hidden group"
                        style={{ width: `${(data.outstanding / maxValue) * 100}%` }}
                      >
                        <span className="text-xs font-bold text-white">Outstanding</span>
                        <span className="text-xs font-bold text-white">{formatCurrency(data.outstanding)}</span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded shadow-sm" />
                <span className="text-sm text-gray-700 font-semibold">Disbursed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded shadow-sm" />
                <span className="text-sm text-gray-700 font-semibold">Repaid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded shadow-sm" />
                <span className="text-sm text-gray-700 font-semibold">Outstanding</span>
              </div>
            </div>
          </div>

          {/* Product Distribution with Interest Rates */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Loan Products</h3>
                <p className="text-sm text-gray-600 mt-1">Portfolio distribution</p>
              </div>
              <PieChart className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-5">
              {productDistribution.map((product, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 ${product.color} rounded-full shadow-md`} />
                      <div>
                        <p className="text-sm font-bold text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{product.value}%</p>
                      <p className="text-xs text-green-600 font-semibold">{product.rate}% rate</p>
                    </div>
                  </div>
                  <div className="space-y-2 ml-7">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                      <div 
                        className={`bg-gradient-to-r ${product.gradient} h-3 rounded-full transition-all duration-700`}
                        style={{ width: `${product.value}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-600 font-medium">Count</p>
                        <p className="font-bold text-gray-900">{product.count}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-600 font-medium">Amount</p>
                        <p className="font-bold text-gray-900">{formatCurrency(product.amount)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-600 font-medium">Tenure</p>
                        <p className="font-bold text-gray-900">{product.tenure}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <p className="text-4xl font-bold text-gray-900">{stats.totalLoans}</p>
              <p className="text-sm text-gray-600 mt-1 font-semibold">Total Portfolio Loans</p>
            </div>
          </div>
        </div>

        {/* Profit vs Loss Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Profit vs Loss Analysis</h3>
              <p className="text-sm text-gray-600 mt-1">Financial performance breakdown</p>
            </div>
            <PieChart className="w-6 h-6 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="url(#profitGradient)" 
                      strokeWidth="20"
                      strokeDasharray={`${(stats.totalProfit / (stats.totalProfit + stats.totalLoss)) * 251.2} 251.2`}
                      className="transition-all duration-1000"
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="url(#lossGradient)" 
                      strokeWidth="20"
                      strokeDasharray={`${(stats.totalLoss / (stats.totalProfit + stats.totalLoss)) * 251.2} 251.2`}
                      strokeDashoffset={`-${(stats.totalProfit / (stats.totalProfit + stats.totalLoss)) * 251.2}`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="profitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="lossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <p className="text-3xl font-bold text-gray-900">{stats.profitMargin}%</p>
                    <p className="text-sm text-gray-600 font-medium">Net Margin</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-md" />
                    <p className="text-sm font-bold text-gray-700">Total Profit</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(stats.totalProfit)}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Share</span>
                    <span className="font-bold text-gray-900">{((stats.totalProfit / (stats.totalProfit + stats.totalLoss)) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Earned</span>
                    <span className="font-bold text-green-600">{formatCurrency(stats.totalProfit)}</span>
                  </div>
                </div>
              </div>
              <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-md" />
                    <p className="text-sm font-bold text-gray-700">Total Loss</p>
                  </div>
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600 mb-2">{formatCurrency(stats.totalLoss)}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Share</span>
                    <span className="font-bold text-gray-900">{((stats.totalLoss / (stats.totalProfit + stats.totalLoss)) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Defaults</span>
                    <span className="font-bold text-red-600">{stats.defaultedLoans} loans</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Net Position</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalProfit - stats.totalLoss)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Alerts & Officer Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Overdue Alerts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border-b-2 border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-xl shadow-sm">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Critical Overdue Loans</h3>
                    <p className="text-sm text-gray-600 font-medium">Requires immediate attention</p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-bold shadow-lg">
                  {overdueAlerts.length}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {overdueAlerts.map((alert, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{alert.customer}</p>
                      <p className="text-sm text-gray-600 mt-1 font-medium">{alert.loanId}</p>
                    </div>
                    <span className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-xs font-bold shadow-md">
                      {alert.daysOverdue} days
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white rounded-lg p-3 border border-red-100">
                      <p className="text-xs text-gray-600 font-medium mb-1">Principal</p>
                      <p className="font-bold text-gray-900">{formatCurrency(alert.principal)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-red-100">
                      <p className="text-xs text-gray-600 font-medium mb-1">Expected</p>
                      <p className="font-bold text-red-600">{formatCurrency(alert.expected)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-red-100">
                      <p className="text-xs text-gray-600 font-medium mb-1">Interest</p>
                      <p className="font-bold text-orange-600">{formatCurrency(alert.interest)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-red-100">
                      <p className="text-xs text-gray-600 font-medium mb-1">Total Due</p>
                      <p className="font-bold text-gray-900">{formatCurrency(alert.amount)}</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-md flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Contact Customer Now
                  </button>
                </div>
              ))}
              <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                View All Overdue Loans
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Officer Performance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border-b-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Loan Officer Performance</h3>
                    <p className="text-sm text-gray-600 font-medium">Collection rates and activity</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {officerPerformance.map((officer, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{officer.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-600 font-medium">{officer.loans} loans</p>
                        <span className="text-gray-400">•</span>
                        <p className="text-sm text-gray-600 font-medium">{officer.customers} customers</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md ${
                      officer.rate >= 93 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 
                      officer.rate >= 90 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' : 
                      'bg-gradient-to-r from-red-500 to-red-600 text-white'
                    }`}>
                      {officer.rate}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                    <div className="bg-white rounded-lg p-2 border border-blue-100">
                      <p className="text-gray-600 font-medium">Disbursed</p>
                      <p className="font-bold text-gray-900">{formatCurrency(officer.disbursed)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-blue-100">
                      <p className="text-gray-600 font-medium">Collected</p>
                      <p className="font-bold text-green-600">{formatCurrency(officer.collected)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-blue-100">
                      <p className="text-gray-600 font-medium">Overdue</p>
                      <p className="font-bold text-red-600">{officer.overdue}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all shadow-sm"
                      style={{ width: `${officer.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Loans Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 py-5 border-b-2 border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Loan Applications</h3>
              <p className="text-sm text-gray-600 mt-1 font-medium">Latest loan requests and their status</p>
            </div>
            <button className="text-sm text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1 px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all">
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Loan ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tenure</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Officer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y-2 divide-gray-100">
                {recentLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-blue-600">{loan.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{loan.customerName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 font-medium">{loan.loanType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(loan.amount)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 font-medium">{loan.tenure}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 font-medium">{loan.officer}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 font-medium">{loan.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-xl border-2 ${getStatusColor(loan.status)}`}>
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-5 bg-white border-2 border-gray-200 rounded-2xl hover:shadow-xl transition-all flex items-center gap-3 group hover:border-blue-300">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-lg">Add Customer</p>
              <p className="text-xs text-gray-600 font-medium">Register new customer</p>
            </div>
          </button>
          <button className="p-5 bg-white border-2 border-gray-200 rounded-2xl hover:shadow-xl transition-all flex items-center gap-3 group hover:border-green-300">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-lg">New Loan</p>
              <p className="text-xs text-gray-600 font-medium">Create loan application</p>
            </div>
          </button>
          <button className="p-5 bg-white border-2 border-gray-200 rounded-2xl hover:shadow-xl transition-all flex items-center gap-3 group hover:border-purple-300">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-lg">Record Payment</p>
              <p className="text-xs text-gray-600 font-medium">Process repayment</p>
            </div>
          </button>
          <button className="p-5 bg-white border-2 border-gray-200 rounded-2xl hover:shadow-xl transition-all flex items-center gap-3 group hover:border-orange-300">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-lg">Generate Report</p>
              <p className="text-xs text-gray-600 font-medium">Export analytics</p>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;


// "use client";

// import React, { useState } from 'react';
// import { 
//   Users, Wallet, DollarSign, TrendingUp, TrendingDown, 
//   AlertCircle, CheckCircle, Clock, XCircle,
//   Home, UserPlus, FileText, CreditCard, BarChart3,
//   Menu, X, ChevronRight, Calendar, Bell
// } from 'lucide-react';

// const AdminDashboard = () => {
//   const [currentPage, setCurrentPage] = useState('dashboard');
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   // Core Statistics (from PRD Section 9.1)
//   const stats = {
//     totalCustomers: 1247,
//     totalLoans: 856,
//     totalDisbursed: 45680000,
//     totalRepaid: 32450000,
//     outstanding: 13230000,
//     overdueLoans: 23,
//     completedLoans: 623,
//     activeLoans: 210,
//     pendingApprovals: 15,
//     totalProfit: 8920000,
//     totalLoss: 450000
//   };

//   // Loan Products (from PRD Section 2.1)
//   const loanProducts = [
//     {
//       name: 'Monthly Loan',
//       type: 'Individual',
//       tenure: 'Up to 6 months',
//       interest: '25%',
//       repayment: 'Monthly',
//       color: 'blue',
//       count: 385,
//       amount: 18500000
//     },
//     {
//       name: 'Weekly Loan',
//       type: 'Group',
//       tenure: 'Up to 24 weeks',
//       interest: '27%',
//       repayment: 'Weekly',
//       color: 'purple',
//       count: 300,
//       amount: 15200000,
//       requires: 'Union Leader + Secretary'
//     },
//     {
//       name: 'Daily Loan',
//       type: 'Individual/Group',
//       tenure: 'Max 20 days',
//       interest: '18%',
//       repayment: 'Daily',
//       color: 'green',
//       count: 171,
//       amount: 11980000
//     }
//   ];

//   // Recent Loans
//   const recentLoans = [
//     { id: 'LN-2024-001', customer: 'Adebayo Oluwaseun', product: 'Monthly', amount: 250000, status: 'pending', date: '2024-12-01' },
//     { id: 'LN-2024-002', customer: 'Chioma Nwankwo', product: 'Weekly', amount: 150000, status: 'approved', date: '2024-12-01' },
//     { id: 'LN-2024-003', customer: 'Ibrahim Musa', product: 'Daily', amount: 50000, status: 'active', date: '2024-11-30' },
//     { id: 'LN-2024-004', customer: 'Blessing Okafor', product: 'Monthly', amount: 300000, status: 'overdue', date: '2024-11-28' },
//     { id: 'LN-2024-005', customer: 'Yusuf Abdullahi', product: 'Weekly', amount: 180000, status: 'completed', date: '2024-11-30' }
//   ];

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-NG', {
//       style: 'currency',
//       currency: 'NGN',
//       minimumFractionDigits: 0
//     }).format(amount);
//   };

//   const getStatusBadge = (status) => {
//     const styles = {
//       pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
//       approved: 'bg-blue-100 text-blue-700 border-blue-300',
//       active: 'bg-green-100 text-green-700 border-green-300',
//       overdue: 'bg-red-100 text-red-700 border-red-300',
//       completed: 'bg-gray-100 text-gray-700 border-gray-300'
//     };
//     return styles[status] || styles.pending;
//   };

//   const getStatusIcon = (status) => {
//     switch(status) {
//       case 'pending': return <Clock className="w-4 h-4" />;
//       case 'approved': return <CheckCircle className="w-4 h-4" />;
//       case 'active': return <TrendingUp className="w-4 h-4" />;
//       case 'overdue': return <AlertCircle className="w-4 h-4" />;
//       case 'completed': return <CheckCircle className="w-4 h-4" />;
//       default: return <Clock className="w-4 h-4" />;
//     }
//   };



//   const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
//     <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
//           <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
//           {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
//         </div>
//         <div className={`p-3 rounded-lg ${color}`}>
//           <Icon className="w-4 h-4 text-white" />
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex h-screen bg-gray-50">
 

//       {/* Main Content */}
//       <main className="flex-1 overflow-auto">
//                       {/* Enhanced Header */}
//         <div className=" p-4">
//           <div className="flex items-center justify-between ">
//             <div>
//               <div className="flex items-center gap-3">
//                 <h1 className="text-5xl font-black bg-gradient-to-r from-green-500 via-green-400 to-green-500 bg-clip-text text-transparent">
//                   Admin Dashboard
//                 </h1>
//                 <span className="px-2 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full shadow-lg animate-pulse">
//                   ● Live
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Dashboard Content */}
//         <div className="px-5 pb-5">
          
//           {/* Alert Banner - Overdue Loans */}
//           {stats.overdueLoans > 0 && (
//             <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
//               <div className="flex items-center gap-3">
//                 <AlertCircle className="w-5 h-5 text-red-600" />
//                 <div>
//                   <p className="font-semibold text-red-900">
//                     {stats.overdueLoans} Overdue Loans Requiring Attention
//                   </p>
//                   <p className="text-sm text-red-700">
//                     Review and contact customers immediately
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Key Metrics - PRD Section 9.1 */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <StatCard
//               title="Total Customers"
//               value={stats.totalCustomers.toLocaleString()}
//               icon={Users}
//               color="bg-blue-600"
//             />
//             <StatCard
//               title="Total Loans"
//               value={stats.totalLoans.toLocaleString()}
//               subtitle={`${stats.activeLoans} active`}
//               icon={Wallet}
//               color="bg-purple-600"
//             />
//             <StatCard
//               title="Total Disbursed"
//               value={formatCurrency(stats.totalDisbursed)}
//               icon={DollarSign}
//               color="bg-green-600"
//             />
//             <StatCard
//               title="Outstanding"
//               value={formatCurrency(stats.outstanding)}
//               icon={TrendingUp}
//               color="bg-orange-600"
//             />
//           </div>

//           {/* Financial Summary */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             <div className="bg-white rounded-lg p-6 border border-gray-200">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="p-3 bg-green-100 rounded-lg">
//                   <TrendingUp className="w-6 h-6 text-green-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Profit</p>
//                   <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalProfit)}</p>
//                 </div>
//               </div>
//               <p className="text-xs text-gray-600">Interest earned from loans</p>
//             </div>

//             <div className="bg-white rounded-lg p-6 border border-gray-200">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="p-3 bg-red-100 rounded-lg">
//                   <TrendingDown className="w-6 h-6 text-red-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Loss</p>
//                   <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalLoss)}</p>
//                 </div>
//               </div>
//               <p className="text-xs text-gray-600">Defaults and unpaid balances</p>
//             </div>

//             <div className="bg-white rounded-lg p-6 border border-gray-200">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="p-3 bg-blue-100 rounded-lg">
//                   <CheckCircle className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Completed Loans</p>
//                   <p className="text-2xl font-bold text-blue-600">{stats.completedLoans}</p>
//                 </div>
//               </div>
//               <p className="text-xs text-gray-600">Successfully closed loans</p>
//             </div>
//           </div>

//           {/* Loan Products - PRD Section 2.1 */}
//           <div className="mb-8">
//             <h3 className="text-lg font-bold text-gray-900 mb-4">Loan Products</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {loanProducts.map((product, index) => (
//                 <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
//                   <div className="flex items-start justify-between mb-4">
//                     <div>
//                       <h4 className="font-bold text-gray-900">{product.name}</h4>
//                       <p className="text-sm text-gray-600">{product.type}</p>
//                     </div>
//                     <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
//                       {product.interest}
//                     </span>
//                   </div>
                  
//                   <div className="space-y-2 mb-4">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Tenure:</span>
//                       <span className="font-semibold text-gray-900">{product.tenure}</span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Repayment:</span>
//                       <span className="font-semibold text-gray-900">{product.repayment}</span>
//                     </div>
//                     {product.requires && (
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-600">Requires:</span>
//                         <span className="font-semibold text-gray-900 text-right">{product.requires}</span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="pt-4 border-t border-gray-200">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <p className="text-xs text-gray-600">Active Loans</p>
//                         <p className="text-lg font-bold text-gray-900">{product.count}</p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-xs text-gray-600">Total Amount</p>
//                         <p className="text-lg font-bold text-gray-900">{formatCurrency(product.amount)}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Recent Loans */}
//           <div className="bg-white rounded-lg border border-gray-200">
//             <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
//               <div>
//                 <h3 className="text-lg font-bold text-gray-900">Recent Loan Applications</h3>
//                 <p className="text-sm text-gray-600 mt-1">Latest loan requests and status</p>
//               </div>
//               <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
//                 View All
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Loan ID</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {recentLoans.map((loan) => (
//                     <tr key={loan.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4">
//                         <span className="text-sm font-semibold text-blue-600">{loan.id}</span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="text-sm font-medium text-gray-900">{loan.customer}</span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="text-sm text-gray-700">{loan.product}</span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="text-sm font-semibold text-gray-900">{formatCurrency(loan.amount)}</span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="text-sm text-gray-600">{loan.date}</span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(loan.status)}`}>
//                           {getStatusIcon(loan.status)}
//                           {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
//             <button 
//               onClick={() => setCurrentPage('customers')}
//               className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left group"
//             >
//               <UserPlus className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
//               <p className="font-bold text-gray-900">Add Customer</p>
//               <p className="text-sm text-gray-600">Register new customer</p>
//             </button>
            
//             <button 
//               onClick={() => setCurrentPage('loans')}
//               className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all text-left group"
//             >
//               <FileText className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
//               <p className="font-bold text-gray-900">Create Loan</p>
//               <p className="text-sm text-gray-600">New loan application</p>
//             </button>
            
//             <button 
//               onClick={() => setCurrentPage('repayments')}
//               className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all text-left group"
//             >
//               <CreditCard className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
//               <p className="font-bold text-gray-900">Record Payment</p>
//               <p className="text-sm text-gray-600">Process repayment</p>
//             </button>
            
//             <button 
//               onClick={() => setCurrentPage('reports')}
//               className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all text-left group"
//             >
//               <BarChart3 className="w-8 h-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
//               <p className="font-bold text-gray-900">View Reports</p>
//               <p className="text-sm text-gray-600">Analytics & insights</p>
//             </button>
//           </div>

//         </div>
//       </main>
//     </div>
//   );
// };

// export default AdminDashboard;