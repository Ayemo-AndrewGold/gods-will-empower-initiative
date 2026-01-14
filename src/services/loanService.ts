// src/services/loanService.ts - Loan API calls
import api from './api';

export interface Loan {
  _id: string;
  loanId: string;
  customer: any;
  loanProduct: 'Monthly' | 'Weekly' | 'Daily';
  principalAmount: number;
  interestRate: number;
  interestAmount: number;
  totalPayable: number;
  tenure: number;
  installmentAmount: number;
  startDate?: string;
  endDate?: string;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed' | 'Overdue';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  disbursedBy?: string;
  disbursedAt?: string;
  disbursementMethod?: string;
  totalPaid: number;
  interestPaid: number;
  principalPaid: number;
  remainingBalance: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanData {
  customer: string;
  loanProduct: 'Monthly' | 'Weekly' | 'Daily';
  principalAmount: number;
  interestRate: number;
  interestAmount: number;
  totalPayable: number;
  tenure: number;
  tenureUnit: string;
  installmentAmount: number;
  purpose: string;
  startDate?: string;
}

class LoanService {
  // Create new loan
  async createLoan(loanData: CreateLoanData): Promise<Loan> {
    const response = await api.post('/loans', loanData);
    return response.data.data;
  }

  // Get all loans
  async getAllLoans(params?: { status?: string; loanProduct?: string; customer?: string }): Promise<Loan[]> {
    const response = await api.get('/loans', { params });
    return response.data.data;
  }

  // Get single loan
  async getLoan(id: string): Promise<Loan> {
    const response = await api.get(`/loans/${id}`);
    return response.data.data;
  }

  // Update loan
  async updateLoan(id: string, loanData: Partial<CreateLoanData>): Promise<Loan> {
    const response = await api.put(`/loans/${id}`, loanData);
    return response.data.data;
  }

  // Approve loan (Admin only)
  async approveLoan(id: string): Promise<Loan> {
    const response = await api.put(`/loans/${id}/approve`);
    return response.data.data;
  }

  // Reject loan (Admin only)
  async rejectLoan(id: string, reason: string): Promise<Loan> {
    const response = await api.put(`/loans/${id}/reject`, { rejectionReason: reason });
    return response.data.data;
  }

  // Disburse loan (Admin only)
  async disburseLoan(id: string, disbursementData: { disbursementMethod: string; notes?: string }): Promise<Loan> {
    const response = await api.put(`/loans/${id}/disburse`, disbursementData);
    return response.data.data;
  }

  // Delete loan (Admin only)
  async deleteLoan(id: string): Promise<void> {
    await api.delete(`/loans/${id}`);
  }

  // Get loan statistics (Admin only)
  async getLoanStats(): Promise<any> {
    const response = await api.get('/loans/stats/summary');
    return response.data.data;
  }
}

export default new LoanService();