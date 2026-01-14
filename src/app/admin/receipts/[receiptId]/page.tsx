"use client";

import React, { useState, useEffect } from 'react';
import { Printer, ChevronLeft, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

const API_URL = 'http://localhost:5000/api';

interface ReceiptDetail {
  _id: string;
  repaymentId: string;
  loan: any;
  paymentAmount: number;
  interestPortion: number;
  principalPortion: number;
  remainingBalance: number;
  paymentMethod: string;
  paymentDate: string;
  notes?: string;
}

export default function ReceiptDetailPage({ params }: { params: { receiptId: string } }) {
  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReceiptDetail();
  }, [params.receiptId]);

  const fetchReceiptDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/repayments/${params.receiptId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch receipt details');
      }

      const data = await res.json();
      let receiptData = data.data || data;

      // Enrich with loan and customer data if not populated
      if (!receiptData.loan?.customer && (receiptData.loan?._id || receiptData.loan?.id)) {
        try {
          const loanId = receiptData.loan._id || receiptData.loan.id;
          const loanRes = await fetch(`${API_URL}/loans/${loanId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (loanRes.ok) {
            const loanData = await loanRes.json();
            const loanDetails = loanData.data || loanData;
            receiptData = {
              ...receiptData,
              loan: loanDetails
            };
          }
        } catch (err) {
          console.error('Error fetching loan details:', err);
        }
      }

      setReceipt(receiptData);
    } catch (err: any) {
      console.error('Error fetching receipt detail:', err);
      setError(err.message || 'Failed to load receipt');
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

  const printReceipt = () => {
    if (!receipt) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receipt.repaymentId || receipt._id}</title>
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
              <p>Receipt ID: ${receipt.repaymentId || receipt._id}</p>
            </div>
            <div class="row"><span class="label">Customer:</span> <span>${receipt.loan?.customer?.firstName || ''} ${receipt.loan?.customer?.lastName || ''}</span></div>
            <div class="row"><span class="label">Loan ID:</span> <span>${receipt.loan?.loanId || ''}</span></div>
            <div class="row"><span class="label">Payment Date:</span> <span>${new Date(receipt.paymentDate).toLocaleDateString()}</span></div>
            <div class="row"><span class="label">Payment Method:</span> <span>${receipt.paymentMethod}</span></div>
            <hr>
            <div class="row"><span class="label">Payment Amount:</span> <span>${formatCurrency(receipt.paymentAmount)}</span></div>
            <div class="row"><span class="label">To Interest:</span> <span>${formatCurrency(receipt.interestPortion || 0)}</span></div>
            <div class="row"><span class="label">To Principal:</span> <span>${formatCurrency(receipt.principalPortion || 0)}</span></div>
            <hr>
            <div class="row"><span class="label">Remaining Balance:</span> <span>${formatCurrency(receipt.remainingBalance || 0)}</span></div>
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
          <p className="text-gray-600 font-semibold">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/admin/receipts" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
            <ChevronLeft className="w-5 h-5" />
            Back to Receipts
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-semibold mb-2">Error Loading Receipt</p>
            <p className="text-red-500">{error || 'Receipt not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/receipts" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ChevronLeft className="w-5 h-5" />
            Back to Receipts
          </Link>
          <button
            onClick={printReceipt}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
        </div>

        {/* Receipt Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Header Section */}
            <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">God's Will Empowerment Initiative</h1>
              <p className="text-sm text-gray-600">Microfinance Services</p>
              <p className="text-xs text-gray-500 mt-1">Lagos, Nigeria</p>
            </div>

            {/* Receipt Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">PAYMENT RECEIPT</h2>
              <p className="text-sm text-gray-600">
                Receipt No: <span className="font-semibold text-gray-900">{receipt.repaymentId || receipt._id}</span>
              </p>
            </div>

            {/* Recipient Details */}
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Customer Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {receipt.loan?.customer?.firstName || '-'} {receipt.loan?.customer?.lastName || ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Loan ID</p>
                  <p className="text-lg font-semibold text-blue-600">{receipt.loan?.loanId || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Loan Type</p>
                  <p className="text-lg font-semibold text-gray-900">{receipt.loan?.loanProduct || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Payment Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(receipt.paymentDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                  <p className="text-lg font-semibold text-gray-900">{receipt.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Recorded By</p>
                  <p className="text-lg font-semibold text-gray-900">Admin</p>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-6 text-lg">Payment Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                  <span className="text-gray-600 font-medium">Payment Amount</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(receipt.paymentAmount)}</span>
                </div>
                <div className="space-y-3 py-4 border-b border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Interest Deducted</span>
                    <span className="text-lg font-semibold text-orange-600">
                      {formatCurrency(receipt.interestPortion || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Principal Paid</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {formatCurrency(receipt.principalPortion || 0)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-gray-900 font-semibold text-lg">Remaining Balance</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(receipt.remainingBalance || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {receipt.notes && (
              <div className="bg-blue-50 rounded-lg p-4 mb-8 border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Notes</p>
                <p className="text-gray-900">{receipt.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-8 border-t-2 border-gray-300">
              <p className="text-sm text-gray-600 mb-2">Thank you for your payment!</p>
              <p className="text-xs text-gray-500">
                This is an official receipt from God's Will Empowerment Initiative
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Generated on: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}