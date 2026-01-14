"use client";

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Search, Plus, Download, Printer,
  ChevronLeft, ChevronRight, X, DollarSign, Calendar,
  CheckCircle, AlertCircle, TrendingUp, Receipt, Loader2
} from 'lucide-react';

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
    try {
      // First try fetching all loans
      const res = await fetch(`${API_URL}/loans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch loans');
      const response = await res.json();
      
      let allLoans = response.data || response;
      
      // Ensure it's an array
      if (!Array.isArray(allLoans)) {
        console.warn('Loans response is not an array:', allLoans);
        allLoans = [];
      }
      
      console.log('All loans received:', allLoans);
      
      // Log each loan's status for debugging
      allLoans.forEach((loan: any, idx: number) => {
        console.log(`Loan ${idx}:`, {
          id: loan._id,
          loanId: loan.loanId,
          status: loan.status,
          loanStatus: loan.loanStatus,
          customer: loan.customer?.firstName || 'Unknown'
        });
      });
      
      // Filter for ONLY Active status (loans must be disbursed, not just approved)
      const activeLoans = allLoans.filter((l: any) => {
        const status = l.status || l.loanStatus || '';
        const isActive = status === 'Active' || status.toLowerCase() === 'active';
        return isActive;
      });
      
      console.log('Total loans:', allLoans.length, 'Active loans:', activeLoans.length);
      
      return activeLoans;
    } catch (error) {
      console.error('Error fetching active loans:', error);
      return [];
    }
  }
};

export default function RepaymentsPage() {
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLoan, setFilterLoan] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastPayment, setLastPayment] = useState<any>(null);
  const [loanSearchTerm, setLoanSearchTerm] = useState('');
  const [showLoanDropdown, setShowLoanDropdown] = useState(false);
  
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    loanId: '',
    paymentAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    notes: ''
  });

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
      let repaymentData = Array.isArray(data) ? data : [];

      // Enrich repayments with loan and customer data if not already populated
      repaymentData = await Promise.all(repaymentData.map(async (repayment: any) => {
        // If loan data with customer is already populated, use it
        if (repayment.loan?.customer) {
          return repayment;
        }

        // Otherwise, fetch the loan data to get customer information
        if (repayment.loan?._id || repayment.loan?.id) {
          try {
            const loanId = repayment.loan._id || repayment.loan.id;
            const token = localStorage.getItem('token');
            const loanRes = await fetch(`${API_URL}/loans/${loanId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (loanRes.ok) {
              const loanData = await loanRes.json();
              const loanDetails = loanData.data || loanData;
              return {
                ...repayment,
                loan: loanDetails
              };
            }
          } catch (err) {
            console.error('Error fetching loan details for repayment:', err);
          }
        }
        return repayment;
      }));

      setRepayments(repaymentData);
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

  const calculatePaymentAllocation = () => {
    if (!formData.paymentAmount || !selectedLoan) return null;

    const paymentAmount = parseFloat(formData.paymentAmount);
    const outstandingBalance = selectedLoan.outstandingBalance || selectedLoan.remainingBalance || 0;
    const amountPaid = selectedLoan.amountPaid || 0;
    const interestAmount = selectedLoan.interestAmount || 0;
    const principal = selectedLoan.principalAmount || selectedLoan.principal || 0;

    const interestPaid = Math.min(amountPaid, interestAmount);
    const principalPaid = Math.max(0, amountPaid - interestAmount);
    const remainingInterest = Math.max(0, interestAmount - interestPaid);
    const remainingPrincipal = Math.max(0, principal - principalPaid);

    let interestPortion = 0;
    let principalPortion = 0;

    // Interest is cleared first
    if (remainingInterest > 0) {
      interestPortion = Math.min(paymentAmount, remainingInterest);
      principalPortion = Math.min(paymentAmount - interestPortion, remainingPrincipal);
    } else {
      principalPortion = Math.min(paymentAmount, remainingPrincipal);
    }

    return {
      paymentAmount: interestPortion + principalPortion,
      interestPortion,
      principalPortion,
      newRemainingBalance: Math.max(0, outstandingBalance - (interestPortion + principalPortion)),
      remainingInterest: Math.max(0, remainingInterest - interestPortion),
      remainingPrincipal: Math.max(0, remainingPrincipal - principalPortion)
    };
  };

  const paymentAllocation = calculatePaymentAllocation();

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === 'loanId') {
      setFormData(prev => ({ ...prev, loanId: value, paymentAmount: '' }));
      // Fetch last payment for the selected loan
      fetchLastPayment(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const fetchLastPayment = async (loanId: string) => {
    if (!loanId) {
      setLastPayment(null);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      // Find the last payment from the repayments list for this loan
      const loanRepayments = repayments.filter((r: any) => r.loan?._id === loanId);
      if (loanRepayments.length > 0) {
        // Sort by date (most recent first) and get the latest one
        const sortedPayments = loanRepayments.sort((a: any, b: any) => 
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        );
        setLastPayment(sortedPayments[0]);
      } else {
        setLastPayment(null);
      }
    } catch (err) {
      console.error('Error fetching last payment:', err);
      setLastPayment(null);
    }
  };

  // Get filtered loans based on search term
  const filteredActiveLoans = activeLoans.filter((loan: any) => {
    const searchLower = loanSearchTerm.toLowerCase();
    const customerName = `${loan.customer?.firstName || ''} ${loan.customer?.lastName || ''}`.toLowerCase();
    const phone = (loan.customer?.phoneNumber || '').toLowerCase();
    const loanId = (loan.loanId || '').toLowerCase();
    
    return customerName.includes(searchLower) || 
           phone.includes(searchLower) || 
           loanId.includes(searchLower);
  });

  // Check if a loan has payment history
  const getLoanPaymentStatus = (loanId: string) => {
    return repayments.some((r: any) => r.loan?._id === loanId);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (!formData.loanId || !formData.paymentAmount || !formData.paymentDate) {
        alert('Please fill in all required fields');
        return;
      }

      const allocation = calculatePaymentAllocation();
      const outstandingBalance = selectedLoan?.outstandingBalance || selectedLoan?.remainingBalance || 0;
      
      if (!allocation || allocation.paymentAmount > outstandingBalance) {
        alert('Invalid payment amount. Cannot exceed outstanding balance.');
        return;
      }

      const repaymentData = {
        loan: formData.loanId,
        paymentAmount: allocation.paymentAmount,
        paymentMethod: formData.paymentMethod,
        transactionReference: '',
        notes: formData.notes
      };

      const result = await repaymentService.recordRepayment(repaymentData);
      await fetchData();
      setShowRecordModal(false);
      setSelectedReceipt(result.data || result);
      setShowReceiptModal(true);
      resetForm();
      alert('✅ Payment recorded successfully!');
    } catch (err: any) {
      alert('❌ ' + err.message);
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
    setLastPayment(null);
    setLoanSearchTerm('');
    setShowLoanDropdown(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const exportToCSV = () => {
    const headers = ['Payment ID', 'Loan ID', 'Customer', 'Amount', 'Date', 'Method'];
    const rows = filteredRepayments.map((r: any) => [
      r.repaymentId || r._id,
      r.loan?.loanId,
      `${r.loan?.customer?.firstName} ${r.loan?.customer?.lastName}`,
      r.paymentAmount,
      r.paymentDate,
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
            <div class="row"><span class="label">Customer:</span> <span>${selectedReceipt.loan?.customer?.firstName} ${selectedReceipt.loan?.customer?.lastName}</span></div>
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

  const filteredRepayments = repayments.filter((payment: any) => {
    const customerName = payment.loan?.customer 
      ? `${payment.loan.customer.firstName} ${payment.loan.customer.lastName}`.toLowerCase()
      : '';
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = customerName.includes(searchLower) ||
                         (payment.repaymentId || '').toLowerCase().includes(searchLower) ||
                         (payment.loan?.loanId || '').toLowerCase().includes(searchLower);
    const matchesLoan = filterLoan === 'all' || payment.loan?._id === filterLoan;
    return matchesSearch && matchesLoan;
  });

  const totalPages = Math.ceil(filteredRepayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRepayments = filteredRepayments.slice(startIndex, endIndex);

  const stats = {
    totalRepayments: repayments.length,
    totalCollected: repayments.reduce((sum: number, r: any) => sum + (r.paymentAmount || 0), 0),
    todayCollections: repayments.filter((r: any) => 
      r.paymentDate === new Date().toISOString().split('T')[0]
    ).length,
    activeLoansCount: activeLoans.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading repayments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Repayment Management</h1>
            <p className="text-gray-600">Record and track loan repayments</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportToCSV} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />Export
            </button>
            <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors">
              <Printer className="w-4 h-4" />Print
            </button>
            <button onClick={() => setShowRecordModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 shadow-md transition-colors">
              <Plus className="w-5 h-5" />Record Payment
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Repayments</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalRepayments}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Collected</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCollected)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Collections</p>
              <p className="text-3xl font-bold text-purple-600">{stats.todayCollections}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Loans</p>
              <p className="text-3xl font-bold text-orange-600">{stats.activeLoansCount}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, payment ID, or loan ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select value={filterLoan} onChange={(e) => setFilterLoan(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="all">All Loans</option>
            {activeLoans.map((loan: any) => (
              <option key={loan._id} value={loan._id}>{loan.loanId} - {loan.customer?.firstName} {loan.customer?.lastName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Repayments Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Payment ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Loan ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount Paid</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Interest</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Principal</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentRepayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center">
                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No repayments found</p>
                    <p className="text-gray-400 text-sm">{repayments.length === 0 ? 'Click "Record Payment" to start' : 'Try adjusting your search'}</p>
                  </td>
                </tr>
              ) : (
                currentRepayments.map((payment: any) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4"><span className="text-sm font-semibold text-green-600">{payment.repaymentId || payment._id}</span></td>
                    <td className="px-6 py-4"><span className="text-sm font-semibold text-blue-600">{payment.loan?.loanId}</span></td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{payment.loan?.customer?.firstName} {payment.loan?.customer?.lastName}</span>
                        <p className="text-xs text-gray-500">{payment.loan?.loanProduct}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm font-bold text-green-600">{formatCurrency(payment.paymentAmount)}</span></td>
                    <td className="px-6 py-4"><span className="text-sm font-semibold text-orange-600">{formatCurrency(payment.interestPortion || 0)}</span></td>
                    <td className="px-6 py-4"><span className="text-sm font-semibold text-blue-600">{formatCurrency(payment.principalPortion || 0)}</span></td>
                    <td className="px-6 py-4"><span className="text-sm font-semibold text-gray-900">{formatCurrency(payment.remainingBalance || 0)}</span></td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-600">{new Date(payment.paymentDate).toLocaleDateString()}</span></td>
                    <td className="px-6 py-4"><span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">{payment.paymentMethod}</span></td>
                    <td className="px-6 py-4">
                      <button onClick={() => { setSelectedReceipt(payment); setShowReceiptModal(true); }} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="View Receipt">
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredRepayments.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, filteredRepayments.length)}</span> of <span className="font-semibold">{filteredRepayments.length}</span> repayments
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm font-medium">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Record Repayment</h2>
                <p className="text-sm text-gray-600 mt-1">Select loan and enter payment details</p>
              </div>
              <button onClick={() => { setShowRecordModal(false); resetForm(); }} disabled={submitting} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Select Active Loan</h3>
                {activeLoans.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                    <p className="text-yellow-800 font-medium">No active loans available</p>
                    <p className="text-yellow-700 text-sm mt-1"><strong>Workflow:</strong> Approve loan → Then click <strong>Disburse</strong> button to make it Active → Then you can record repayments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by name, phone, or loan ID..."
                        value={loanSearchTerm}
                        onChange={(e) => setLoanSearchTerm(e.target.value)}
                        disabled={submitting}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 text-sm"
                      />
                    </div>

                    {/* Dropdown with filtered options */}
                    <select 
                      name="loanId" 
                      value={formData.loanId} 
                      onChange={handleInputChange} 
                      disabled={submitting} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                      <option value="">Choose a loan...</option>
                      {filteredActiveLoans.map((loan: any) => {
                        const hasPayment = getLoanPaymentStatus(loan._id);
                        const paymentIndicator = hasPayment ? '🟢' : '⚪';
                        return (
                          <option key={loan._id} value={loan._id}>
                            {paymentIndicator} {loan.loanId} - {loan.customer?.firstName} {loan.customer?.lastName} | {loan.customer?.phoneNumber} | {loan.loanProduct} | Balance: {formatCurrency(loan.outstandingBalance || loan.remainingBalance || 0)}
                          </option>
                        );
                      })}
                    </select>

                    {/* Results count */}
                    <p className="text-xs text-gray-600">
                      Showing {filteredActiveLoans.length} of {activeLoans.length} loans
                      {loanSearchTerm && ` (Filtered by "${loanSearchTerm}")`}
                    </p>
                  </div>
                )}
              </div>

              {selectedLoan && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Loan Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Payable</p>
                        <p className="font-bold text-gray-900">{formatCurrency(selectedLoan.totalPayable || selectedLoan.totalAmount || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount Paid</p>
                        <p className="font-bold text-green-600">{formatCurrency(selectedLoan.amountPaid || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Remaining Balance</p>
                        <p className="font-bold text-orange-600">{formatCurrency(selectedLoan.outstandingBalance || selectedLoan.remainingBalance || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Installment</p>
                        <p className="font-bold text-blue-600">{formatCurrency(selectedLoan.installmentAmount || 0)}</p>
                      </div>
                    </div>
                  </div>

                  {lastPayment && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Last Payment Record</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Payment Amount</p>
                          <p className="font-bold text-green-600">{formatCurrency(lastPayment.paymentAmount || 0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Payment Date</p>
                          <p className="font-bold text-gray-900">{new Date(lastPayment.paymentDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Payment Method</p>
                          <p className="font-bold text-blue-600">{lastPayment.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Balance After</p>
                          <p className="font-bold text-gray-900">{formatCurrency(lastPayment.remainingBalance || 0)}</p>
                        </div>
                      </div>
                      {lastPayment.notes && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <p className="text-xs text-gray-600">Notes</p>
                          <p className="text-sm text-gray-900 italic">{lastPayment.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Payment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Amount (₦) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="paymentAmount"
                          value={formData.paymentAmount}
                          onChange={handleInputChange}
                          disabled={submitting}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                          placeholder="Enter amount"
                          min="0"
                          max={selectedLoan.outstandingBalance || selectedLoan.remainingBalance}
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="paymentDate"
                          value={formData.paymentDate}
                          onChange={handleInputChange}
                          disabled={submitting}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleInputChange}
                          disabled={submitting}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      disabled={submitting}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      placeholder="Add any additional notes..."
                    />
                  </div>

                  {paymentAllocation && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Payment Allocation (Interest First)
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Payment Amount</p>
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(paymentAllocation.paymentAmount)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">To Interest</p>
                          <p className="text-lg font-bold text-orange-600">{formatCurrency(paymentAllocation.interestPortion)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">To Principal</p>
                          <p className="text-lg font-bold text-blue-600">{formatCurrency(paymentAllocation.principalPortion)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">New Balance</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(paymentAllocation.newRemainingBalance)}</p>
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
                      className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Recording...
                        </>
                      ) : (
                        'Record Payment'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 print:hidden">
              <h2 className="text-xl font-bold text-gray-900">Payment Receipt</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={printReceipt}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button 
                  onClick={() => setShowReceiptModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">God's Will Empowerment Initiative</h1>
                <p className="text-sm text-gray-600">Microfinance Services</p>
                <p className="text-xs text-gray-500 mt-1">Lagos, Nigeria</p>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">PAYMENT RECEIPT</h2>
                <p className="text-sm text-gray-600">Receipt No: <span className="font-semibold text-gray-900">{selectedReceipt.repaymentId || selectedReceipt._id}</span></p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Customer Name</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedReceipt.loan?.customer?.firstName} {selectedReceipt.loan?.customer?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Loan ID</p>
                    <p className="text-sm font-semibold text-blue-600">{selectedReceipt.loan?.loanId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Loan Type</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedReceipt.loan?.loanProduct}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Payment Date</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(selectedReceipt.paymentDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedReceipt.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Recorded By</p>
                    <p className="text-sm font-semibold text-gray-900">Admin</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Payment Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Payment Amount</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(selectedReceipt.paymentAmount)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Interest Deducted</span>
                      <span className="text-sm font-semibold text-orange-600">{formatCurrency(selectedReceipt.interestPortion || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Principal Paid</span>
                      <span className="text-sm font-semibold text-blue-600">{formatCurrency(selectedReceipt.principalPortion || 0)}</span>
                    </div>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-900">Remaining Balance</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(selectedReceipt.remainingBalance || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedReceipt.notes && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-xs text-gray-600 mb-1">Notes</p>
                  <p className="text-sm text-gray-900">{selectedReceipt.notes}</p>
                </div>
              )}

              <div className="text-center pt-6 border-t border-gray-300">
                <p className="text-xs text-gray-600 mb-2">Thank you for your payment!</p>
                <p className="text-xs text-gray-500">This is an official receipt from God's Will Empowerment Initiative</p>
                <p className="text-xs text-gray-500 mt-1">Generated on: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}