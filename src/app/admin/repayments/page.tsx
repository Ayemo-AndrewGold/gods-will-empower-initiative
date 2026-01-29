"use client";

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Search, Plus, Download, Printer,
  ChevronLeft, ChevronRight, X, DollarSign, Calendar,
  CheckCircle, AlertCircle, TrendingUp, Receipt, Loader2,
  History, User
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api';

// API Services
const repaymentService = {
  getAllRepayments: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/repayments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch repayments');
    const response = await res.json();
    return response.data || response;
  },

  recordRepayment: async (data: any) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/repayments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to record repayment');
    }
    return res.json();
  }
};

const loanService = {
  getActiveLoans: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/loans`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch loans');
    const response = await res.json();
    const allLoans = response.data || response;
    return Array.isArray(allLoans) 
      ? allLoans.filter((l: any) => 
          l.status?.toLowerCase() === 'active' || 
          l.status?.toLowerCase() === 'disbursed'
        )
      : [];
  }
};

export default function RepaymentsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [selectedLoanHistory, setSelectedLoanHistory] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLoan, setFilterLoan] = useState('all');
  const [viewMode, setViewMode] = useState<'all' | 'grouped'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loanSearchTerm, setLoanSearchTerm] = useState('');
  
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    loanId: '',
    paymentAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    notes: ''
  });

    // Sync with global dark mode
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchRepayments(), fetchActiveLoans()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepayments = async () => {
    try {
      const data = await repaymentService.getAllRepayments();
      setRepayments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching repayments:', err);
      setRepayments([]);
    }
  };

  const fetchActiveLoans = async () => {
    try {
      const data = await loanService.getActiveLoans();
      setActiveLoans(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching active loans:', err);
      setActiveLoans([]);
    }
  };

  const selectedLoan = activeLoans.find(l => l._id === formData.loanId);

  // Safely get customer name from a repayment/loan object, with multiple fallbacks
  const getCustomerNameFromLoan = (loan: any) => {
    if (!loan) return '';

    const customer = loan.customer || loan.borrower || loan.client;
    if (!customer && (loan.customerName || loan.borrowerName || loan.clientName)) {
      return loan.customerName || loan.borrowerName || loan.clientName;
    }

    if (!customer) return '';

    const firstName = customer.firstName || customer.firstname || '';
    const lastName = customer.lastName || customer.lastname || '';
    const combined = `${firstName} ${lastName}`.trim();

    if (combined) return combined;

    return (
      customer.name ||
      customer.fullName ||
      loan.customerName ||
      loan.borrowerName ||
      loan.clientName ||
      ''
    );
  };

  const getCustomerNameFromPayment = (payment: any) => {
    if (!payment) return '';

    // If backend populates the `customer` field directly on repayment
    let fromCustomer = '';
    if (payment.customer && typeof payment.customer === 'object') {
      fromCustomer = getCustomerNameFromLoan({ customer: payment.customer });
    }

    return (
      fromCustomer ||
      getCustomerNameFromLoan(payment.loan) ||
      payment.customerName ||
      payment.customerFullName ||
      ''
    );
  };

  // Helpers for loan repayment status and balances
  const getLoanTotalPaid = (loan: any) => {
    if (!loan) return 0;
    return loan.totalPaid ?? loan.amountPaid ?? 0;
  };

  const getLoanRemainingBalance = (loan: any) => {
    if (!loan) return 0;
    return (
      loan.remainingBalance ??
      loan.outstandingBalance ??
      loan.balance ??
      0
    );
  };

  const hasLoanStartedPaying = (loan: any) => {
    return getLoanTotalPaid(loan) > 0;
  };

  const calculatePaymentAllocation = () => {
    if (!formData.paymentAmount || !selectedLoan) return null;

    const paymentAmount = parseFloat(formData.paymentAmount);
    const totalPayable = selectedLoan.totalPayable || selectedLoan.totalAmount || 0;
    const totalPaid = getLoanTotalPaid(selectedLoan);
    const interestAmount = selectedLoan.interestAmount || 0;
    const principalAmount = selectedLoan.principalAmount || selectedLoan.principal || 0;
    
    // Calculate what's already been paid (interest first, then principal)
    const interestPaidSoFar = selectedLoan.interestPaid || Math.min(totalPaid, interestAmount);
    const principalPaidSoFar = selectedLoan.principalPaid || Math.max(0, totalPaid - interestAmount);
    
    // Calculate remaining amounts
    const remainingInterest = Math.max(0, interestAmount - interestPaidSoFar);
    const remainingPrincipal = Math.max(0, principalAmount - principalPaidSoFar);
    const outstandingBalance = totalPayable - totalPaid;

    // Allocate payment: interest first, then principal
    let interestPortion = 0;
    let principalPortion = 0;

    if (remainingInterest > 0) {
      interestPortion = Math.min(paymentAmount, remainingInterest);
      principalPortion = Math.min(paymentAmount - interestPortion, remainingPrincipal);
    } else {
      principalPortion = Math.min(paymentAmount, remainingPrincipal);
    }

    // Calculate new balances after this payment
    const newTotalPaid = totalPaid + paymentAmount;
    const newInterestPaid = interestPaidSoFar + interestPortion;
    const newPrincipalPaid = principalPaidSoFar + principalPortion;
    const newRemainingBalance = Math.max(0, totalPayable - newTotalPaid);

    return {
      paymentAmount: interestPortion + principalPortion,
      interestPortion,
      principalPortion,
      newRemainingBalance,
      newTotalPaid,
      newInterestPaid,
      newPrincipalPaid,
      remainingInterest: Math.max(0, remainingInterest - interestPortion),
      remainingPrincipal: Math.max(0, remainingPrincipal - principalPortion)
    };
  };

  const paymentAllocation = calculatePaymentAllocation();

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'loanId') setFormData(prev => ({ ...prev, paymentAmount: '' }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (!formData.loanId || !formData.paymentAmount || !formData.paymentDate) {
        toast.error('Please fill in all required fields');
        return;
      }

      const allocation = calculatePaymentAllocation();
      const outstandingBalance = selectedLoan?.outstandingBalance || selectedLoan?.remainingBalance || 0;
      
      if (!allocation || allocation.paymentAmount > outstandingBalance) {
        toast.error('Invalid payment amount. Cannot exceed outstanding balance.');
        return;
      }

      const repaymentData = {
        loan: formData.loanId,
        paymentAmount: allocation.paymentAmount,
        interestPortion: allocation.interestPortion,
        principalPortion: allocation.principalPortion,
        paymentMethod: formData.paymentMethod,
        transactionReference: '',
        notes: formData.notes
      };

      const result = await repaymentService.recordRepayment(repaymentData);
      
      // Refresh data to show updated balances
      await fetchData();
      
      setShowRecordModal(false);
      setSelectedReceipt(result.data || result);
      setShowReceiptModal(true);
      resetForm();
      toast.success('? Payment recorded successfully! Loan balance has been updated.');
    } catch (err: any) {
      toast.error('? ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      loanId: '',
      paymentAmount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      notes: ''
    });
    setLoanSearchTerm('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const exportToCSV = () => {
    const headers = ['Payment ID', 'Loan ID', 'Customer', 'Amount', 'Interest', 'Principal', 'Balance After', 'Date', 'Method'];
    const rows = filteredRepayments.map((r: any) => [
      r.repaymentId || r._id,
      r.loan?.loanId,
      getCustomerNameFromPayment(r),
      r.paymentAmount,
      r.interestPortion || 0,
      r.principalPortion || 0,
      r.remainingBalance || 0,
      new Date(r.paymentDate).toLocaleDateString(),
      r.paymentMethod
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repayments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReceipt = () => {
    if (!selectedReceipt) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${selectedReceipt.repaymentId || selectedReceipt._id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt { max-width: 600px; margin: 0 auto; border: 2px solid #000; padding: 30px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #000; text-align: center; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>PAYMENT RECEIPT</h1>
              <p>Receipt ID: ${selectedReceipt.repaymentId || selectedReceipt._id}</p>
            </div>
            <div class="row"><span class="label">Customer:</span> <span>${getCustomerNameFromPayment(selectedReceipt)}</span></div>
            <div class="row"><span class="label">Loan ID:</span> <span>${selectedReceipt.loan?.loanId}</span></div>
            <div class="row"><span class="label">Payment Date:</span> <span>${new Date(selectedReceipt.paymentDate).toLocaleDateString()}</span></div>
            <div class="row"><span class="label">Payment Method:</span> <span>${selectedReceipt.paymentMethod}</span></div>
            <hr>
            <div class="row"><span class="label">Payment Amount:</span> <span>${formatCurrency(selectedReceipt.paymentAmount)}</span></div>
            <div class="row"><span class="label">To Interest:</span> <span>${formatCurrency(selectedReceipt.interestPortion || 0)}</span></div>
            <div class="row"><span class="label">To Principal:</span> <span>${formatCurrency(selectedReceipt.principalPortion || 0)}</span></div>
            <hr>
            <div class="row"><span class="label">Remaining Balance:</span> <span>${formatCurrency(selectedReceipt.remainingBalance || 0)}</span></div>
            ${selectedReceipt.notes ? `<div class="row"><span class="label">Notes:</span> <span>${selectedReceipt.notes}</span></div>` : ''}
            <div class="footer">
              <p>Thank you for your payment!</p>
              <p>Printed on ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const viewPaymentHistory = (loanId: string) => {
    const loanPayments = repayments
      .filter((r: any) => r.loan?._id === loanId)
      .sort((a: any, b: any) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    
    const loan = repayments.find((r: any) => r.loan?._id === loanId)?.loan;
    
    setSelectedLoanHistory({
      loan,
      payments: loanPayments
    });
    setShowPaymentHistory(true);
  };

  const filteredRepayments = repayments.filter((payment: any) => {
    const customerName = getCustomerNameFromPayment(payment).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      customerName.includes(searchLower) ||
      (payment.repaymentId || '').toLowerCase().includes(searchLower) ||
      (payment.loan?.loanId || '').toLowerCase().includes(searchLower);
    const matchesLoan = filterLoan === 'all' || payment.loan?._id === filterLoan;
    return matchesSearch && matchesLoan;
  });

  // Group repayments by loan for grouped view
  const groupedRepayments = filteredRepayments.reduce((acc: any, payment: any) => {
    const loanId = payment.loan?._id;
    if (!loanId) return acc;
    
    if (!acc[loanId]) {
      acc[loanId] = {
        loan: payment.loan,
        payments: [],
        totalPaid: 0,
        paymentCount: 0,
        lastPaymentDate: null
      };
    }
    
    acc[loanId].payments.push(payment);
    acc[loanId].totalPaid += payment.paymentAmount || 0;
    acc[loanId].paymentCount += 1;
    
    const paymentDate = new Date(payment.paymentDate);
    if (!acc[loanId].lastPaymentDate || paymentDate > acc[loanId].lastPaymentDate) {
      acc[loanId].lastPaymentDate = paymentDate;
    }
    
    return acc;
  }, {});

  const groupedData = Object.values(groupedRepayments);

  const displayData = viewMode === 'grouped' ? groupedData : filteredRepayments;
  const totalPages = Math.ceil(displayData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = displayData.slice(startIndex, endIndex);

  // Get filtered loans
  const filteredActiveLoans = activeLoans.filter((loan: any) => {
    const searchLower = loanSearchTerm.toLowerCase();
    const customerName = `${loan.customer?.firstName || ''} ${loan.customer?.lastName || ''}`.toLowerCase();
    const phone = (loan.customer?.phoneNumber || '').toLowerCase();
    const loanId = (loan.loanId || '').toLowerCase();
    
    return customerName.includes(searchLower) || phone.includes(searchLower) || loanId.includes(searchLower);
  });

  const stats = {
    totalRepayments: repayments.length,
    totalCollected: repayments.reduce((sum: number, r: any) => sum + (r.paymentAmount || 0), 0),
    todayCollections: repayments.filter((r: any) => {
      const paymentDate = r.paymentDate ? new Date(r.paymentDate).toISOString().split('T')[0] : '';
      const today = new Date().toISOString().split('T')[0];
      return paymentDate === today;
    }).reduce((sum: number, r: any) => sum + (r.paymentAmount || 0), 0),
    activeLoansCount: activeLoans.length,
    uniqueCustomers: new Set(repayments.map((r: any) => r.loan?.customer?._id).filter(Boolean)).size
  };

 if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${
        isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-blue-50'
      }`}>
        <div className="text-center">
          <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${
            isDarkMode ? 'text-orange-500' : 'text-green-600'
          }`} />
          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
            Loading repayments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen px-1 transition-colors duration-200 ${
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
                Repayment Management
              </h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Record and track loan repayments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={exportToCSV}
                className={`px-4 py-2.5 border rounded-xl transition-colors flex items-center gap-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Download className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Export
                </span>
              </button>
              <button 
                onClick={() => window.print()}
                className={`px-4 py-2.5 border rounded-xl transition-colors flex items-center gap-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Printer className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Print
                </span>
              </button>
              <button 
                onClick={() => setShowRecordModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 shadow-md transition-colors"
              >
                <Plus className="w-5 h-5" />
                Record Payment
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 mb-6">
          <div className={`rounded-2xl p-6 border shadow-sm ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Transactions
                </p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalRepayments}
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {stats.uniqueCustomers} customers
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 border shadow-sm ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Collected
                </p>
                <p className={`text-2xl font-bold pt-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {formatCurrency(stats.totalCollected)}
                </p>
              </div>
              {/* <div className="p-1 bg-green-100 rounded-sm">
                <DollarSign className="w-3 h-3 text-green-600" />
              </div> */}
            </div>
          </div>

          <div className={`rounded-2xl p-6 border shadow-sm ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Today's Collections
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {formatCurrency(stats.todayCollections)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 border shadow-sm ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Active Loans
                </p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  {stats.activeLoansCount}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={`rounded-2xl border p-4 mb-6 shadow-sm ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search by customer name, payment ID, or loan ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <select 
              value={filterLoan} 
              onChange={(e) => setFilterLoan(e.target.value)}
              className={`px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Loans</option>
              {activeLoans.map((loan: any) => (
                <option key={loan._id} value={loan._id}>
                  {loan.loanId} - {loan.customer?.firstName} {loan.customer?.lastName}
                </option>
              ))}
            </select>
            <div className={`flex gap-2 border rounded-xl p-1 ${
              isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
            }`}>
              <button
                onClick={() => { setViewMode('all'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'all' 
                    ? isDarkMode 
                      ? 'bg-gray-600 text-white shadow-sm' 
                      : 'bg-white text-gray-900 shadow-sm'
                    : isDarkMode
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Payments
              </button>
              <button
                onClick={() => { setViewMode('grouped'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grouped' 
                    ? isDarkMode 
                      ? 'bg-gray-600 text-white shadow-sm' 
                      : 'bg-white text-gray-900 shadow-sm'
                    : isDarkMode
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                By Customer
              </button>
            </div>
          </div>
        </div>

      {/* Repayments Table */}
        <div className={`rounded-2xl border overflow-hidden shadow-sm ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${
                isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <tr>
                  {viewMode === 'all' ? (
                    <>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Payment ID</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Loan ID</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Customer</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Amount Paid</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Interest</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Principal</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Balance After</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Date</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Method</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Actions</th>
                  </>
                ) : (
                  <>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Loan ID</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Customer</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Payments</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Total Paid</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Current Balance</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Last Payment</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={viewMode === 'all' ? 10 : 7} className="px-6 py-16 text-center">
                    <CreditCard className={`w-16 h-16 mx-auto mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-300'
                      }`} />
                    <p className={`text-lg mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No repayments found</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{repayments.length === 0 ? 'Click "Record Payment" to start' : 'Try adjusting your search'}</p>
                  </td>
                </tr>
              ) : viewMode === 'all' ? (
                currentItems.map((payment: any) => (
                  <tr key={payment._id} className={`transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}>
                    <td className="px-6 py-4"><span className={`text-sm font-semibold ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}>{payment.repaymentId || payment._id.slice(-6)}</span></td>
                    <td className="px-6 py-4"><span className={`text-sm font-semibold ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>{payment.loan?.loanId}</span></td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                          {getCustomerNameFromPayment(payment) || 'Unknown Customer'}
                        </span>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{payment.loan?.loanProduct}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className={`text-sm font-bold ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}>{formatCurrency(payment.paymentAmount)}</span></td>
                    <td className="px-6 py-4"><span className={`text-sm font-semibold ${
                          isDarkMode ? 'text-orange-400' : 'text-orange-600'
                        }`}>{formatCurrency(payment.interestPortion || 0)}</span></td>
                    <td className="px-6 py-4"><span className={`text-sm font-semibold ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>{formatCurrency(payment.principalPortion || 0)}</span></td>
                    <td className="px-6 py-4"><span className={`text-sm font-semibold ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-900'
                        }`}>{formatCurrency(payment.remainingBalance || 0)}</span></td>
                    <td className="px-6 py-4"><span className={`text-sm ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-600'
                        }`}>{new Date(payment.paymentDate).toLocaleDateString()}</span></td>
                    <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          isDarkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-700'
                        }`}>{payment.paymentMethod}</span></td>
                    <td className="px-6 py-4">
                      <button onClick={() => { setSelectedReceipt(payment); setShowReceiptModal(true); }} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="View Receipt">
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                currentItems.map((group: any) => {
                  const firstPayment = group.payments && group.payments[0];
                  const customerName = firstPayment ? getCustomerNameFromPayment(firstPayment) : '';

                  return (
                    <tr key={group.loan?._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`}>
                          {group.loan?.loanId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          <div>
                            <span className={`text-sm font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                              {customerName || 'Unknown Customer'}
                            </span>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{group.loan?.loanProduct}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${
                            isDarkMode ? 'text-purple-400' : 'text-purple-600'
                          }`}>
                          {group.paymentCount} payment{group.paymentCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                          {formatCurrency(group.totalPaid)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${
                            isDarkMode ? 'text-orange-400' : 'text-orange-600'
                          }`}>
                          {formatCurrency(group.payments[0]?.remainingBalance || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {group.lastPaymentDate?.toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => viewPaymentHistory(group.loan?._id)}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              isDarkMode 
                                ? 'text-blue-400 bg-blue-900/30 hover:bg-blue-900/50' 
                                : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                            }`}
                        >
                          <History className="w-3.5 h-3.5" />
                          View History
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {displayData.length > 0 && (
          <div className={`px-6 py-4 border-t flex items-center justify-between ${
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
            <div className="text-sm text-gray-600">
              Showing <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, displayData.length)}</span> of <span className="font-semibold">{displayData.length}</span> {viewMode === 'all' ? 'payments' : 'customers'}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className={`p-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-300 hover:bg-white'
                  }`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className={`px-4 py-2 text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className={`p-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-300 hover:bg-white'
                  }`}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between z-10 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Record Repayment</h2>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select loan and enter payment details</p>
              </div>
              <button onClick={() => { setShowRecordModal(false); resetForm(); }} disabled={submitting} className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Step 1: Select Active Loan</h3>
                {activeLoans.length === 0 ? (
                  <div className={`border rounded-xl p-4 text-center ${
                    isDarkMode 
                      ? 'bg-yellow-900/20 border-yellow-800' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <AlertCircle className={`w-12 h-12 mx-auto mb-2 ${
                      isDarkMode ? 'text-yellow-500' : 'text-yellow-600'
                    }`} />
                    <p className={`font-medium ${
                      isDarkMode ? 'text-yellow-400' : 'text-yellow-800'
                    }`}>No active loans available</p>
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-yellow-500' : 'text-yellow-700'
                    }`}>Approve loan ? Click Disburse ? Then record repayments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <input
                        type="text"
                        placeholder="Search by name, phone, or loan ID..."
                        value={loanSearchTerm}
                        onChange={(e) => setLoanSearchTerm(e.target.value)}
                        disabled={submitting}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 text-sm ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <select
                      name="loanId"
                      value={formData.loanId}
                      onChange={handleInputChange}
                      disabled={submitting}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="">Choose a loan...</option>
                      {filteredActiveLoans.map((loan: any) => {
                        const totalPaid = getLoanTotalPaid(loan);
                        const remaining = getLoanRemainingBalance(loan);
                        const started = hasLoanStartedPaying(loan);
                        const statusLabel = started ? '🟢 Paying' : '⚪ Not started';
                        return (
                          <option key={loan._id} value={loan._id}>
                            {statusLabel} {loan.loanId} - {loan.customer?.firstName} {loan.customer?.lastName} |{' '}
                            {loan.customer?.phoneNumber} | Paid: {formatCurrency(totalPaid)} | Balance:{' '}
                            {formatCurrency(remaining)}
                          </option>
                        );
                      })}
                    </select>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Showing {filteredActiveLoans.length} of {activeLoans.length} loans</p>
                  </div>
                )}
              </div>

              {selectedLoan && (
                <>
                  <div className={`rounded-xl p-4 border ${
                    isDarkMode 
                      ? 'bg-blue-900/20 border-blue-800' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <h4 className={`font-semibold mb-3 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Loan Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Payable</p>
                        <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(selectedLoan.totalPayable || selectedLoan.totalAmount || 0)}</p>
                      </div>
                      <div>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Amount Paid</p>
                        <p className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {formatCurrency(getLoanTotalPaid(selectedLoan))}
                        </p>
                      </div>
                      <div>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Remaining Balance</p>
                        <p className={`font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                          {formatCurrency(getLoanRemainingBalance(selectedLoan))}
                        </p>
                      </div>
                      <div>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Installment</p>
                        <p className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{formatCurrency(selectedLoan.installmentAmount || 0)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Step 2: Payment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Payment Amount (?) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="paymentAmount"
                          value={formData.paymentAmount}
                          onChange={handleInputChange}
                          disabled={submitting}
                          className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300'
                          }`}
                          placeholder="Enter amount"
                          min="0"
                          max={getLoanRemainingBalance(selectedLoan)}
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Payment Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="paymentDate"
                          value={formData.paymentDate}
                          onChange={handleInputChange}
                          disabled={submitting}
                          className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Payment Method <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleInputChange}
                          disabled={submitting}
                          className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Mobile Money">Mobile Money</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      disabled={submitting}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300'
                      }`}
                      placeholder="Add any additional notes..."
                    />
                  </div>

                  {paymentAllocation && (
                    <div className={`border-2 rounded-lg p-6 ${
                      isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                    }`}>
                      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        <CheckCircle className={`w-5 h-5 ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`} />
                        Payment Allocation (Interest First)
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className={`rounded-lg p-4 border ${
                          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-200'
                        }`}>
                          <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Amount</p>
                          <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(paymentAllocation.paymentAmount)}</p>
                        </div>
                        <div className={`rounded-lg p-4 border ${
                          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-200'
                        }`}>
                          <p className="text-xs text-gray-600 mb-1">To Interest</p>
                          <p className="text-lg font-bold text-orange-600">{formatCurrency(paymentAllocation.interestPortion)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>To Principal</p>
                          <p className={`text-lg font-bold ${
                            isDarkMode ? 'text-orange-400' : 'text-orange-600'
                          }`}>{formatCurrency(paymentAllocation.principalPortion)}</p>
                        </div>
                        <div className={`rounded-lg p-4 border ${
                          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-green-200'
                        }`}>
                          <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>New Balance</p>
                          <p className={`text-lg font-bold ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>{formatCurrency(paymentAllocation.newRemainingBalance)}</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Interest Remaining After Payment</p>
                            <p className="text-sm font-semibold text-orange-600">{formatCurrency(paymentAllocation.remainingInterest)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Principal Remaining After Payment</p>
                            <p className="text-sm font-semibold text-blue-600">{formatCurrency(paymentAllocation.remainingPrincipal)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => { setShowRecordModal(false); resetForm(); }}
                      disabled={submitting}
                      className={`px-6 py-2 border rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode 
                          ? 'border-gray-600 hover:bg-gray-700' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Recording...</>) : 'Record Payment'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentHistory && selectedLoanHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between z-10 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment History</h2>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedLoanHistory.loan?.loanId} - {selectedLoanHistory.loan?.customer?.firstName} {selectedLoanHistory.loan?.customer?.lastName}</p>
              </div>
              <button onClick={() => setShowPaymentHistory(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className={`border rounded-lg p-4 mb-6 ${
                isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Payments</p>
                    <p className="font-bold text-gray-900">{selectedLoanHistory.payments.length}</p>
                  </div>
                  <div>
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Paid</p>
                    <p className="font-bold text-green-600">{formatCurrency(selectedLoanHistory.payments.reduce((sum: number, p: any) => sum + (p.paymentAmount || 0), 0))}</p>
                  </div>
                  <div>
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Current Balance</p>
                    <p className="font-bold text-orange-600">{formatCurrency(selectedLoanHistory.payments[0]?.remainingBalance || 0)}</p>
                  </div>
                  <div>
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loan Product</p>
                    <p className="font-bold text-blue-600">{selectedLoanHistory.loan?.loanProduct}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {selectedLoanHistory.payments.map((payment: any, idx: number) => (
                  <div key={payment._id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">#{idx + 1}</span>
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(payment.paymentAmount)}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(payment.paymentDate).toLocaleDateString()} � {payment.paymentMethod}</p>
                        </div>
                      </div>
                      <button onClick={() => { setSelectedReceipt(payment); setShowReceiptModal(true); }} className={`text-xs font-medium ${
                          isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                        }`}>
                        View Receipt
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className={`rounded p-2 ${
                        isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'
                      }`}>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Interest</p>
                        <p className={`font-semibold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{formatCurrency(payment.interestPortion || 0)}</p>
                      </div>
                      <div className={`rounded p-2 ${
                        isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                      }`}>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Principal</p>
                        <p className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{formatCurrency(payment.principalPortion || 0)}</p>
                      </div>
                      <div className={`rounded p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Balance After</p>
                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(payment.remainingBalance || 0)}</p>
                      </div>
                    </div>
                    {payment.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Notes: <span className={`italic ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{payment.notes}</span></p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between z-10 print:hidden ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Receipt</h2>
              <div className="flex items-center gap-3">
                <button onClick={printReceipt} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  <Printer className="w-4 h-4" />Print
                </button>
                <button onClick={() => setShowReceiptModal(false)} className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className={`text-center mb-8 border-b-2 pb-6 ${
                isDarkMode ? 'border-gray-700' : 'border-gray-300'
              }`}>
                <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>God's Will Empowerment Initiative</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Microfinance Services</p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Lagos, Nigeria</p>
              </div>
              <div className="text-center mb-6">
                <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>PAYMENT RECEIPT</h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Receipt No:{' '}
                  <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedReceipt.repaymentId || selectedReceipt._id}
                  </span>
                </p>
              </div>
              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Customer Name</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getCustomerNameFromPayment(selectedReceipt) || 'Unknown Customer'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loan ID</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{selectedReceipt.loan?.loanId}</p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loan Type</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedReceipt.loan?.loanProduct}</p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Date</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{new Date(selectedReceipt.paymentDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Method</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedReceipt.paymentMethod}</p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Recorded By</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin</p>
                  </div>
                </div>
              </div>
              <div className={`rounded-lg p-6 mb-6 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Amount</span>
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{formatCurrency(selectedReceipt.paymentAmount)}</span>
                  </div>
                  <div className={`border-t pt-3 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Interest Deducted</span>
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{formatCurrency(selectedReceipt.interestPortion || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Principal Paid</span>
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{formatCurrency(selectedReceipt.principalPortion || 0)}</span>
                    </div>
                  </div>
                  <div className={`border-t-2 pt-3 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Remaining Balance</span>
                      <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(selectedReceipt.remainingBalance || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {selectedReceipt.notes && (
                <div className={`rounded-lg p-4 mb-6 ${
                  isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Notes</p>
                  <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedReceipt.notes}</p>
                </div>
              )}
              <div className={`text-center pt-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                <p className={`text-center pt-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>Thank you for your payment!</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>This is an official receipt from God's Will Empowerment Initiative</p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Generated on: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}