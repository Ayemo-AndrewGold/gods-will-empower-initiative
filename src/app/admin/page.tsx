"use client";


import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Wallet, DollarSign, AlertCircle, CheckCircle, Clock,BarChart3, PieChart, FileText, ArrowUpRight, ArrowDownRight, MoreVertical, Download, Printer, AlertTriangle, Activity, Target, Bell,ChevronRight } from 'lucide-react';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState<string>('month');

  const stats: {
    totalCustomers: number;
    totalLoans: number;
    totalDisbursed: number;
    totalRepaid: number;
    outstanding: number;
    overdueLoans: number;
    completedLoans: number;
    totalProfit: number;
    totalLoss: number;
    activeLoans: number;
    pendingApprovals: number;
    collectionRate: number;
    portfolioAtRisk: number;
  } = {
    totalCustomers: 1247,
    totalLoans: 856,
    totalDisbursed: 45680000,
    totalRepaid: 32450000,
    outstanding: 13230000,
    overdueLoans: 23,
    completedLoans: 623,
    totalProfit: 8920000,
    totalLoss: 450000,
    activeLoans: 210,
    pendingApprovals: 15,
    collectionRate: 92.5,
    portfolioAtRisk: 5.2
  };

  const monthlyData: {
    month: string;
    disbursed: number;
    repaid: number;
    profit: number;
    loans: number;
    overdue: number;
  }[] = [
    { month: 'Jan', disbursed: 3500000, repaid: 2800000, profit: 650000, loans: 68, overdue: 3 },
    { month: 'Feb', disbursed: 4200000, repaid: 3100000, profit: 720000, loans: 75, overdue: 5 },
    { month: 'Mar', disbursed: 3800000, repaid: 3400000, profit: 810000, loans: 71, overdue: 2 },
    { month: 'Apr', disbursed: 4500000, repaid: 3800000, profit: 920000, loans: 82, overdue: 4 },
    { month: 'May', disbursed: 4100000, repaid: 3600000, profit: 780000, loans: 78, overdue: 6 },
    { month: 'Jun', disbursed: 4800000, repaid: 4200000, profit: 950000, loans: 89, overdue: 3 }
  ];

  const productDistribution: {
    name: string;
    value: number;
    amount: number;
    count: number;
    color: string;
    rate: number;
  }[] = [
    { name: 'Monthly Loans', value: 45, amount: 18500000, count: 385, color: 'bg-blue-500', rate: 25 },
    { name: 'Weekly Loans', value: 35, amount: 15200000, count: 300, color: 'bg-purple-500', rate: 27 },
    { name: 'Daily Loans', value: 20, amount: 11980000, count: 171, color: 'bg-green-500', rate: 18 }
  ];

  const recentLoans: {
    id: string;
    customerName: string;
    loanType: string;
    amount: number;
    status: string;
    date: string;
    officer: string;
  }[] = [
    { id: 'LN-2024-001', customerName: 'Adebayo Oluwaseun', loanType: 'Monthly', amount: 250000, status: 'pending', date: '2024-12-01', officer: 'John Doe' },
    { id: 'LN-2024-002', customerName: 'Chioma Nwankwo', loanType: 'Weekly', amount: 150000, status: 'approved', date: '2024-12-01', officer: 'Jane Smith' },
    { id: 'LN-2024-003', customerName: 'Ibrahim Musa', loanType: 'Daily', amount: 50000, status: 'disbursed', date: '2024-11-30', officer: 'John Doe' },
    { id: 'LN-2024-004', customerName: 'Blessing Okafor', loanType: 'Monthly', amount: 300000, status: 'overdue', date: '2024-11-28', officer: 'Mary Johnson' },
    { id: 'LN-2024-005', customerName: 'Yusuf Abdullahi', loanType: 'Weekly', amount: 180000, status: 'pending', date: '2024-11-30', officer: 'Jane Smith' }
  ];

  const overdueAlerts: {
    customer: string;
    loanId: string;
    amount: number;
    daysOverdue: number;
    expected: number;
  }[] = [
    { customer: 'Blessing Okafor', loanId: 'LN-2024-004', amount: 300000, daysOverdue: 12, expected: 125000 },
    { customer: 'Emeka Obi', loanId: 'LN-2024-023', amount: 150000, daysOverdue: 8, expected: 75000 },
    { customer: 'Fatima Ahmed', loanId: 'LN-2024-067', amount: 200000, daysOverdue: 5, expected: 50000 }
  ];

  const officerPerformance: {
    name: string;
    loans: number;
    disbursed: number;
    collected: number;
    rate: number;
    overdue: number;
  }[] = [
    { name: 'John Doe', loans: 145, disbursed: 8500000, collected: 7200000, rate: 94.2, overdue: 3 },
    { name: 'Jane Smith', loans: 132, disbursed: 7800000, collected: 6900000, rate: 91.8, overdue: 5 },
    { name: 'Mary Johnson', loans: 98, disbursed: 5600000, collected: 5100000, rate: 89.5, overdue: 7 },
    { name: 'David Brown', loans: 87, disbursed: 4900000, collected: 4500000, rate: 93.1, overdue: 4 }
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
      case 'disbursed': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    trend?: 'up' | 'down';
    trendValue?: string | number;
    color?: string;
    subtitle?: string;
    badge?: string;
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendValue, color, subtitle, badge }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              {badge && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`${color} p-3 rounded-xl shadow-sm`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {trend && trendValue && (
          <div className="flex items-center pt-3 border-t border-gray-100">
            {trend === 'up' ? (
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span className="text-sm font-semibold">{trendValue}</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                <span className="text-sm font-semibold">{trendValue}</span>
              </div>
            )}
            <span className="text-xs text-gray-500 ml-2">vs last {timeRange}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 min-h-screen w-full p-6">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full animate-pulse">
                  Live
                </span>
              </div>
              <p className="text-gray-600 font-medium">God's Will Empowerment Initiative - Microfinance Operations</p>
              <p className="text-sm text-gray-500 mt-1">Last updated: {new Date().toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {stats.pendingApprovals}
                </span>
              </button>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button className="px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>

          {/* Critical Alerts */}
          {stats.overdueLoans > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
                  <div>
                    <p className="font-semibold text-red-900">Attention Required: {stats.overdueLoans} Overdue Loans</p>
                    <p className="text-sm text-red-700">Total overdue amount: {formatCurrency(stats.outstanding * 0.15)}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all text-sm">
                  Review Overdue →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 mb-8">
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers.toLocaleString()}
            icon={Users}
            trend="up"
            trendValue="+12.5%"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            subtitle={`${stats.activeLoans} active loans`}
            badge="Active"
          />
          <StatCard
            title="Total Disbursed"
            value={formatCurrency(stats.totalDisbursed)}
            icon={Wallet}
            trend="up"
            trendValue="+8.3%"
            color="bg-gradient-to-br from-green-500 to-green-600"
            subtitle={`${stats.totalLoans} total loans`}
          />
          <StatCard
            title="Total Repaid"
            value={formatCurrency(stats.totalRepaid)}
            icon={DollarSign}
            trend="up"
            trendValue="+15.2%"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            subtitle={`${stats.completedLoans} completed`}
          />
          <StatCard
            title="Outstanding"
            value={formatCurrency(stats.outstanding)}
            icon={AlertCircle}
            trend="down"
            trendValue="-3.1%"
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            subtitle={`${stats.overdueLoans} overdue`}
          />
        </div>

        {/* Financial Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Profit</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalProfit)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Profit Margin</span>
                <span className="font-semibold text-green-600">19.5%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Loss</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalLoss)}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Loss Rate</span>
                <span className="font-semibold text-gray-900">0.98%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Collection Rate</p>
                <p className="text-2xl font-bold text-blue-600">{stats.collectionRate}%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${stats.collectionRate}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Portfolio at Risk</p>
                <p className="text-2xl font-bold text-orange-600">{stats.portfolioAtRisk}%</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <Activity className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">Industry Avg: 7.2%</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Monthly Performance */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Monthly Performance</h3>
                <p className="text-sm text-gray-600 mt-1">Disbursement vs Repayment Trends</p>
              </div>
              <BarChart3 className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-5">
              {monthlyData.map((data, index) => {
                const maxValue = Math.max(...monthlyData.map(d => d.disbursed));
                const repaymentRate = ((data.repaid / data.disbursed) * 100).toFixed(1);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800 w-12">{data.month}</span>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-gray-600">{data.loans} loans</span>
                        <span className={`px-2.5 py-1 rounded-full font-medium ${data.overdue > 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {data.overdue} overdue
                        </span>
                        <span className="text-blue-600 font-semibold">{repaymentRate}%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg h-10 flex items-center justify-between px-3 transition-all hover:shadow-lg"
                        style={{ width: `${(data.disbursed / maxValue) * 100}%` }}
                      >
                        <span className="text-xs font-medium text-white">Disbursed</span>
                        <span className="text-xs font-bold text-white">{formatCurrency(data.disbursed)}</span>
                      </div>
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg h-10 flex items-center justify-between px-3 transition-all hover:shadow-lg"
                        style={{ width: `${(data.repaid / maxValue) * 100}%` }}
                      >
                        <span className="text-xs font-medium text-white">Repaid</span>
                        <span className="text-xs font-bold text-white">{formatCurrency(data.repaid)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded" />
                <span className="text-sm text-gray-700 font-medium">Disbursed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded" />
                <span className="text-sm text-gray-700 font-medium">Repaid</span>
              </div>
            </div>
          </div>

          {/* Product Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Loan Products</h3>
                <p className="text-sm text-gray-600 mt-1">Distribution</p>
              </div>
              <PieChart className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-5">
              {productDistribution.map((product, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 ${product.color} rounded-full shadow-sm`} />
                      <span className="text-sm font-semibold text-gray-800">{product.name}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{product.value}%</span>
                  </div>
                  <div className="space-y-2 ml-7">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`${product.color} h-3 rounded-full transition-all duration-700`}
                        style={{ width: `${product.value}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-600">Count</p>
                        <p className="font-bold text-gray-900">{product.count}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-bold text-gray-900">{formatCurrency(product.amount)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <p className="text-3xl font-bold text-gray-900">{stats.totalLoans}</p>
              <p className="text-sm text-gray-600 mt-1">Total Active Loans</p>
            </div>
          </div>
        </div>

        {/* Overdue Alerts & Officer Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Overdue Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Critical Overdue Loans</h3>
                    <p className="text-sm text-gray-600">Requires immediate attention</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-bold">
                  {overdueAlerts.length}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {overdueAlerts.map((alert, index) => (
                <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-xl hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{alert.customer}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.loanId}</p>
                    </div>
                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
                      {alert.daysOverdue} days
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Loan Amount</p>
                      <p className="font-bold text-gray-900">{formatCurrency(alert.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Expected</p>
                      <p className="font-bold text-red-600">{formatCurrency(alert.expected)}</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all">
                    Contact Customer
                  </button>
                </div>
              ))}
              <button className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                View All Overdue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Officer Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Loan Officer Performance</h3>
                    <p className="text-sm text-gray-600">Collection rates and activity</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {officerPerformance.map((officer, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{officer.name}</p>
                      <p className="text-sm text-gray-600">{officer.loans} active loans</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      officer.rate >= 93 ? 'bg-green-100 text-green-700' : 
                      officer.rate >= 90 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {officer.rate}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div>
                      <p className="text-gray-600">Disbursed</p>
                      <p className="font-bold text-gray-900">{formatCurrency(officer.disbursed)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Collected</p>
                      <p className="font-bold text-green-600">{formatCurrency(officer.collected)}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${officer.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Loans Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Loan Applications</h3>
              <p className="text-sm text-gray-600 mt-1">Latest loan requests and their status</p>
            </div>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Officer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {recentLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{loan.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{loan.customerName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{loan.loanType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(loan.amount)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{loan.officer}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{loan.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(loan.status)}`}>
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center gap-3 group">
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Add Customer</p>
              <p className="text-xs text-gray-600">Register new customer</p>
            </div>
          </button>
          <button className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center gap-3 group">
            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">New Loan</p>
              <p className="text-xs text-gray-600">Create loan application</p>
            </div>
          </button>
          <button className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center gap-3 group">
            <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Record Payment</p>
              <p className="text-xs text-gray-600">Process repayment</p>
            </div>
          </button>
          <button className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center gap-3 group">
            <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Generate Report</p>
              <p className="text-xs text-gray-600">Export analytics</p>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;