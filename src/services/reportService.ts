// src/services/reportService.ts - Report & Analytics API calls
import api from './api';

export interface DashboardData {
  customers: {
    total: number;
    pending: number;
    approved: number;
    active: number;
  };
  loans: {
    total: number;
    pending: number;
    active: number;
    completed: number;
    overdue: number;
  };
  financial: {
    totalDisbursed: number;
    totalExpectedRepayment: number;
    totalRepaid: number;
    totalOutstanding: number;
    totalInterestEarned: number;
    repaymentRate: string;
  };
  repayments: {
    total: number;
    pending: number;
  };
  users: {
    total: number;
    active: number;
    loanOfficers: number;
  };
}

export interface MonthlyPerformance {
  month: number;
  monthName: string;
  year: number;
  amountDisbursed: number;
  loansCount: number;
  amountRepaid: number;
  interestEarned: number;
  outstandingAmount: number;
  overdueCount: number;
  profit: number;
}

export interface ProductDistribution {
  byCount: {
    monthly: { count: number; percentage: string };
    weekly: { count: number; percentage: string };
    daily: { count: number; percentage: string };
  };
  byAmount: {
    monthly: { amount: number };
    weekly: { amount: number };
    daily: { amount: number };
  };
}

export interface ProfitLoss {
  profit: {
    total: number;
    expected: number;
    percentage: string;
  };
  loss: {
    total: number;
    potential: number;
    defaultedLoans: number;
    overdueLoans: number;
  };
  netProfit: number;
  profitMargin: string;
}

export interface OfficerPerformance {
  officer: {
    id: string;
    name: string;
    staffId: string;
    email: string;
  };
  metrics: {
    customersRegistered: number;
    loansCreated: number;
    activeLoans: number;
    completedLoans: number;
    totalDisbursed: number;
    totalRepaid: number;
    repaymentsRecorded: number;
    repaymentRate: string;
  };
}

class ReportService {
  // Get dashboard overview (Admin only)
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get('/reports/dashboard');
    return response.data.data;
  }

  // Get monthly performance (Admin only)
  async getMonthlyPerformance(year?: number): Promise<MonthlyPerformance[]> {
    const response = await api.get('/reports/monthly-performance', {
      params: { year }
    });
    return response.data.data;
  }

  // Get product distribution (Admin only)
  async getProductDistribution(): Promise<ProductDistribution> {
    const response = await api.get('/reports/product-distribution');
    return response.data.data;
  }

  // Get profit vs loss (Admin only)
  async getProfitLoss(): Promise<ProfitLoss> {
    const response = await api.get('/reports/profit-loss');
    return response.data.data;
  }

  // Get loan officer performance (Admin only)
  async getOfficerPerformance(): Promise<OfficerPerformance[]> {
    const response = await api.get('/reports/officer-performance');
    return response.data.data;
  }

  // Get loan status breakdown (Admin only)
  async getLoanStatus(): Promise<any> {
    const response = await api.get('/reports/loan-status');
    return response.data.data;
  }

  // Get date range report (Admin only)
  async getDateRangeReport(startDate: string, endDate: string): Promise<any> {
    const response = await api.get('/reports/date-range', {
      params: { startDate, endDate }
    });
    return response.data.data;
  }

  // Export summary (Admin only)
  async exportSummary(): Promise<any> {
    const response = await api.get('/reports/export-summary');
    return response.data.data;
  }
}

export default new ReportService();