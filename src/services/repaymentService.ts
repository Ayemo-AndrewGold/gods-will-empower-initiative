// src/services/repaymentService.ts - Repayment API calls
import api from './api';

export interface Repayment {
  _id: string;
  receiptId: string;
  loan: any;
  paymentAmount: number;
  interestPaid: number;
  principalPaid: number;
  remainingInterest: number;
  remainingPrincipal: number;
  remainingBalance: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Cheque';
  transactionReference?: string;
  paymentDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  recordedBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRepaymentData {
  loan: string;
  paymentAmount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Cheque';
  transactionReference?: string;
  notes?: string;
}

class RepaymentService {
  // Record new repayment
  async recordRepayment(repaymentData: CreateRepaymentData): Promise<Repayment> {
    const response = await api.post('/repayments', repaymentData);
    return response.data.data;
  }

  // Get all repayments
  async getAllRepayments(params?: { status?: string; loan?: string }): Promise<Repayment[]> {
    const response = await api.get('/repayments', { params });
    return response.data.data;
  }

  // Get single repayment
  async getRepayment(id: string): Promise<Repayment> {
    const response = await api.get(`/repayments/${id}`);
    return response.data.data;
  }

  // Get loan repayment history
  async getLoanRepayments(loanId: string): Promise<Repayment[]> {
    const response = await api.get(`/repayments/loan/${loanId}`);
    return response.data.data;
  }

  // Approve repayment (Admin only)
  async approveRepayment(id: string): Promise<Repayment> {
    const response = await api.put(`/repayments/${id}/approve`);
    return response.data.data;
  }

  // Reject repayment (Admin only)
  async rejectRepayment(id: string, reason: string): Promise<Repayment> {
    const response = await api.put(`/repayments/${id}/reject`, { rejectionReason: reason });
    return response.data.data;
  }

  // Get receipt
  async getReceipt(id: string): Promise<any> {
    const response = await api.get(`/repayments/${id}/receipt`);
    return response.data.data;
  }

  // Get repayment statistics (Admin only)
  async getRepaymentStats(): Promise<any> {
    const response = await api.get('/repayments/stats/summary');
    return response.data.data;
  }
}

export default new RepaymentService();