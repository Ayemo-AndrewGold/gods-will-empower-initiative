"use client";

import React, { useState, useEffect } from 'react';
import { 
  Receipt, Search, Download, Printer, ChevronLeft, ChevronRight, X, 
  DollarSign, Calendar, Eye, Loader2, AlertCircle
} from 'lucide-react';

// const API_URL = 'http://localhost:5000/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const repaymentService = {
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

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await repaymentService.getAllRepayments();
      let receiptData = Array.isArray(data) ? data : [];

      // Enrich receipts with loan and customer data if not already populated
      receiptData = await Promise.all(receiptData.map(async (receipt: any) => {
        // If loan data with customer is already populated, use it
        if (receipt.loan?.customer) {
          return receipt;
        }

        // Otherwise, fetch the loan data to get customer information
        if (receipt.loan?._id || receipt.loan?.id) {
          try {
            const loanId = receipt.loan._id || receipt.loan.id;
            const token = localStorage.getItem('token');
            const loanRes = await fetch(`${API_URL}/loans/${loanId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (loanRes.ok) {
              const loanData = await loanRes.json();
              const loanDetails = loanData.data || loanData;
              return {
                ...receipt,
                loan: loanDetails
              };
            }
          } catch (err) {
            console.error('Error fetching loan details for receipt:', err);
          }
        }
        return receipt;
      }));

      setReceipts(receiptData);
    } catch (err: any) {
      console.error('Error fetching receipts:', err);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const filteredReceipts = receipts.filter((receipt: any) => {
    const customerName = receipt.loan?.customer 
      ? `${receipt.loan.customer.firstName} ${receipt.loan.customer.lastName}`.toLowerCase()
      : '';
    const searchLower = searchTerm.toLowerCase();
    return customerName.includes(searchLower) ||
           (receipt.repaymentId || '').toLowerCase().includes(searchLower) ||
           (receipt.loan?.loanId || '').toLowerCase().includes(searchLower);
  });

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReceipts = filteredReceipts.slice(startIndex, endIndex);

  const exportToCSV = () => {
    const headers = ['Receipt ID', 'Loan ID', 'Customer', 'Amount', 'Date', 'Method'];
    const rows = filteredReceipts.map((r: any) => [
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
    a.download = `receipts-${new Date().toISOString().split('T')[0]}.csv`;
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
          <title>Receipt - ${selectedReceipt.repaymentId || selectedReceipt._id}</title>
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
            <div class="row"><span class="label">Customer:</span> <span>${selectedReceipt.loan?.customer?.firstName || ''} ${selectedReceipt.loan?.customer?.lastName || ''}</span></div>
            <div class="row"><span class="label">Loan ID:</span> <span>${selectedReceipt.loan?.loanId || ''}</span></div>
            <div class="row"><span class="label">Payment Date:</span> <span>${new Date(selectedReceipt.paymentDate).toLocaleDateString()}</span></div>
            <div class="row"><span class="label">Payment Method:</span> <span>${selectedReceipt.paymentMethod}</span></div>
            <hr>
            <div class="row"><span class="label">Payment Amount:</span> <span>${formatCurrency(selectedReceipt.paymentAmount)}</span></div>
            <div class="row"><span class="label">To Interest:</span> <span>${formatCurrency(selectedReceipt.interestPortion || 0)}</span></div>
            <div class="row"><span class="label">To Principal:</span> <span>${formatCurrency(selectedReceipt.principalPortion || 0)}</span></div>
            <hr>
            <div class="row"><span class="label">Remaining Balance:</span> <span>${formatCurrency(selectedReceipt.remainingBalance || 0)}</span></div>
            <div class="footer">
              <p>Thank you for your payment!</p>
              <p style="font-size: 12px; margin-top: 20px;">Generated: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading receipts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Receipts</h1>
          <p className="text-gray-600">View and manage all payment receipts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Receipts</p>
                <p className="text-3xl font-bold text-blue-600">{receipts.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Collected</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(receipts.reduce((sum: number, r: any) => sum + (r.paymentAmount || 0), 0))}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Export */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer name, receipt ID, or loan ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={exportToCSV}
              disabled={filteredReceipts.length === 0}
              className="px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Receipts Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Receipt ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Loan ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Balance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">No receipts found</p>
                      <p className="text-gray-400 text-sm">{receipts.length === 0 ? 'No receipts have been generated yet' : 'Try adjusting your search'}</p>
                    </td>
                  </tr>
                ) : (
                  currentReceipts.map((receipt: any) => (
                    <tr key={receipt._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4"><span className="text-sm font-semibold text-blue-600">{receipt.repaymentId || receipt._id}</span></td>
                      <td className="px-6 py-4"><span className="text-sm font-semibold text-blue-600">{receipt.loan?.loanId || '-'}</span></td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {receipt.loan?.customer?.firstName || '-'} {receipt.loan?.customer?.lastName || ''}
                          </span>
                          <p className="text-xs text-gray-500">{receipt.loan?.loanProduct || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-sm font-bold text-green-600">{formatCurrency(receipt.paymentAmount)}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-gray-600">{new Date(receipt.paymentDate).toLocaleDateString()}</span></td>
                      <td className="px-6 py-4"><span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">{receipt.paymentMethod}</span></td>
                      <td className="px-6 py-4"><span className="text-sm font-semibold text-gray-900">{formatCurrency(receipt.remainingBalance || 0)}</span></td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedReceipt(receipt);
                            setShowReceiptModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredReceipts.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, filteredReceipts.length)}</span> of <span className="font-semibold">{filteredReceipts.length}</span> receipts
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm font-medium">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

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
                      <p className="text-sm font-semibold text-gray-900">{selectedReceipt.loan?.customer?.firstName || '-'} {selectedReceipt.loan?.customer?.lastName || ''}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Loan ID</p>
                      <p className="text-sm font-semibold text-blue-600">{selectedReceipt.loan?.loanId || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Loan Type</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedReceipt.loan?.loanProduct || '-'}</p>
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
    </div>
  );
}