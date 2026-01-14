"use client";

import React, { useState } from 'react';
import { 
  BarChart3, Download, Printer, Calendar, TrendingUp, TrendingDown,
  Users, Wallet, DollarSign, PieChart, FileText, AlertCircle,
  CheckCircle, Clock, Filter
} from 'lucide-react';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  // Sample data (in real app, fetch from API)
  const reportData = {
    // Monthly Performance Data (PRD Section 9.2.A)
    monthlyPerformance: [
      { month: 'Jan', disbursed: 3500000, repaid: 2800000, profit: 650000, loans: 68, overdue: 3, outstanding: 700000 },
      { month: 'Feb', disbursed: 4200000, repaid: 3100000, profit: 720000, loans: 75, overdue: 5, outstanding: 1100000 },
      { month: 'Mar', disbursed: 3800000, repaid: 3400000, profit: 810000, loans: 71, overdue: 2, outstanding: 400000 },
      { month: 'Apr', disbursed: 4500000, repaid: 3800000, profit: 920000, loans: 82, overdue: 4, outstanding: 700000 },
      { month: 'May', disbursed: 4100000, repaid: 3600000, profit: 780000, loans: 78, overdue: 6, outstanding: 500000 },
      { month: 'Jun', disbursed: 4800000, repaid: 4200000, profit: 950000, loans: 89, overdue: 3, outstanding: 600000 }
    ],

    // Product Distribution (PRD Section 9.2.B)
    productDistribution: [
      { name: 'Monthly Loans', count: 385, amount: 18500000, percentage: 45, rate: 25, color: 'blue' },
      { name: 'Weekly Product', count: 300, amount: 15200000, percentage: 35, rate: 27, color: 'purple' },
      { name: 'Daily Product', count: 171, amount: 11980000, percentage: 20, rate: 18, color: 'green' }
    ],

    // Profit vs Loss (PRD Section 9.2.C)
    profitLoss: {
      totalProfit: 8920000,
      totalLoss: 450000,
      profitMargin: 19.5,
      lossRate: 0.98,
      netPosition: 8470000
    },

    // Loan Status Distribution
    loanStatus: [
      { status: 'Active', count: 210, amount: 13230000, percentage: 24.5 },
      { status: 'Completed', count: 623, amount: 28500000, percentage: 72.8 },
      { status: 'Overdue', count: 23, amount: 1200000, percentage: 2.7 }
    ],

    // Officer Performance
    officerPerformance: [
      { name: 'John Doe', loans: 145, disbursed: 8500000, collected: 7200000, rate: 94.2, overdue: 3 },
      { name: 'Jane Smith', loans: 132, disbursed: 7800000, collected: 6900000, rate: 91.8, overdue: 5 },
      { name: 'Mary Johnson', loans: 98, disbursed: 5600000, collected: 5100000, rate: 89.5, overdue: 7 },
      { name: 'David Brown', loans: 87, disbursed: 4900000, collected: 4500000, rate: 93.1, overdue: 4 }
    ],

    // Summary Statistics
    summary: {
      totalCustomers: 1247,
      totalLoans: 856,
      totalDisbursed: 45680000,
      totalRepaid: 32450000,
      outstanding: 13230000,
      activeLoans: 210,
      completedLoans: 623,
      overdueLoans: 23,
      collectionRate: 92.5,
      portfolioAtRisk: 5.2
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleExport = () => {
    alert('Exporting report to Excel...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8">
      
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive business performance insights</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'financial', label: 'Financial', icon: DollarSign },
            { id: 'loans', label: 'Loans', icon: Wallet },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'officers', label: 'Officers', icon: CheckCircle }
          ].map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedReport === report.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {report.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalCustomers}</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Loans</p>
          <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalLoans}</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Disbursed</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.summary.totalDisbursed)}</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-semibold text-green-600">{reportData.summary.collectionRate}%</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Collection Rate</p>
          <p className="text-2xl font-bold text-gray-900">{reportData.summary.collectionRate}%</p>
        </div>
      </div>

      {/* Monthly Performance Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Monthly Performance Analysis</h2>
            <p className="text-sm text-gray-600 mt-1">Disbursement, Repayment & Outstanding Trends</p>
          </div>
          <BarChart3 className="w-6 h-6 text-gray-400" />
        </div>

        <div className="space-y-6">
          {reportData.monthlyPerformance.map((data, index) => {
            const maxValue = Math.max(...reportData.monthlyPerformance.map(d => d.disbursed));
            const repaymentRate = ((data.repaid / data.disbursed) * 100).toFixed(1);
            const profitMargin = ((data.profit / data.disbursed) * 100).toFixed(1);
            
            return (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800 w-12">{data.month}</span>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Wallet className="w-3 h-3 text-blue-600" />
                      <span className="text-gray-600 font-medium">{data.loans} loans</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                      data.overdue > 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
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
                  </div>
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl h-12 flex items-center justify-between px-4 transition-all hover:shadow-lg"
                    style={{ width: `${(data.repaid / maxValue) * 100}%` }}
                  >
                    <span className="text-xs font-bold text-white">Repaid</span>
                    <span className="text-xs font-bold text-white">{formatCurrency(data.repaid)}</span>
                  </div>
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl h-10 flex items-center justify-between px-4 transition-all hover:shadow-lg"
                    style={{ width: `${(data.outstanding / maxValue) * 100}%` }}
                  >
                    <span className="text-xs font-bold text-white">Outstanding</span>
                    <span className="text-xs font-bold text-white">{formatCurrency(data.outstanding)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center gap-8">
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

      {/* Product Distribution & Profit/Loss */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Product Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Product Distribution</h2>
              <p className="text-sm text-gray-600 mt-1">Loan portfolio breakdown</p>
            </div>
            <PieChart className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-5">
            {reportData.productDistribution.map((product, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 bg-${product.color}-500 rounded-full shadow-sm`} />
                    <div>
                      <p className="text-sm font-bold text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-600">{product.rate}% interest rate</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{product.percentage}%</span>
                </div>
                <div className="space-y-2 ml-7">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className={`bg-gradient-to-r from-${product.color}-500 to-${product.color}-600 h-3 rounded-full transition-all duration-700`}
                      style={{ width: `${product.percentage}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-600 font-medium">Count</p>
                      <p className="font-bold text-gray-900">{product.count}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-600 font-medium">Amount</p>
                      <p className="font-bold text-gray-900">{formatCurrency(product.amount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
            <p className="text-3xl font-bold text-gray-900">{reportData.summary.totalLoans}</p>
            <p className="text-sm text-gray-600 mt-1 font-semibold">Total Portfolio Loans</p>
          </div>
        </div>

        {/* Profit vs Loss Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Profit vs Loss Analysis</h2>
              <p className="text-sm text-gray-600 mt-1">Financial performance</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>

          <div className="space-y-4">
            {/* Profit Card */}
            <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-md" />
                  <p className="text-sm font-bold text-gray-700">Total Profit</p>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(reportData.profitLoss.totalProfit)}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Margin</span>
                  <span className="font-bold text-gray-900">{reportData.profitLoss.profitMargin}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest Earned</span>
                  <span className="font-bold text-green-600">{formatCurrency(reportData.profitLoss.totalProfit)}</span>
                </div>
              </div>
            </div>

            {/* Loss Card */}
            <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-md" />
                  <p className="text-sm font-bold text-gray-700">Total Loss</p>
                </div>
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600 mb-2">{formatCurrency(reportData.profitLoss.totalLoss)}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loss Rate</span>
                  <span className="font-bold text-gray-900">{reportData.profitLoss.lossRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Defaults</span>
                  <span className="font-bold text-red-600">8 loans</span>
                </div>
              </div>
            </div>

            {/* Net Position */}
            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Net Position</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(reportData.profitLoss.netPosition)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Profit - Loss</p>
                  <p className="text-lg font-bold text-green-600">
                    +{((reportData.profitLoss.totalProfit / (reportData.profitLoss.totalProfit + reportData.profitLoss.totalLoss)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Status Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Loan Status Distribution</h2>
            <p className="text-sm text-gray-600 mt-1">Current portfolio status breakdown</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportData.loanStatus.map((status, index) => (
            <div key={index} className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {status.status === 'Active' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {status.status === 'Completed' && <CheckCircle className="w-5 h-5 text-gray-600" />}
                  {status.status === 'Overdue' && <AlertCircle className="w-5 h-5 text-red-600" />}
                  <p className="font-bold text-gray-900">{status.status}</p>
                </div>
                <span className="text-lg font-bold text-gray-900">{status.percentage}%</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{status.count}</p>
              <p className="text-sm text-gray-600">Loans</p>
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-xs text-gray-600">Total Amount</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(status.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Officer Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Loan Officer Performance</h2>
            <p className="text-sm text-gray-600 mt-1">Individual officer metrics and collection rates</p>
          </div>
        </div>

        <div className="space-y-4">
          {reportData.officerPerformance.map((officer, index) => (
            <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-lg">{officer.name}</p>
                  <p className="text-sm text-gray-600 font-medium">{officer.loans} loans managed</p>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md ${
                  officer.rate >= 93 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 
                  officer.rate >= 90 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' : 
                  'bg-gradient-to-r from-red-500 to-red-600 text-white'
                }`}>
                  {officer.rate}% Collection
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-gray-600 font-medium">Disbursed</p>
                  <p className="font-bold text-gray-900">{formatCurrency(officer.disbursed)}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-gray-600 font-medium">Collected</p>
                  <p className="font-bold text-green-600">{formatCurrency(officer.collected)}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
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
  );
};

export default ReportsPage;