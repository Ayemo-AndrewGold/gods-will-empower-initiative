"use client";

import { useState, useEffect } from 'react';
import { 
  Wallet, Search, Plus, Edit, Eye, 
  DollarSign, Clock, CheckCircle, AlertCircle,
  Download, ChevronLeft, ChevronRight, Printer, TrendingUp,
  X, Loader2, UserCheck, XCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api';

// API Service
const loanService = {
  getAllLoans: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/loans`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch loans');
    const response = await res.json();
    return response.data || response;
  },

  createLoan: async (data: any) => {
    const token = localStorage.getItem('token');
    
    // Validate data before sending
    const requiredFields = ['customer', 'loanProduct', 'principalAmount', 'interestRate', 'interestAmount', 'totalPayable', 'tenure', 'tenureUnit', 'installmentAmount', 'purpose'];
    const missingFields = requiredFields.filter(field => data[field] === undefined || data[field] === null || data[field] === '');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      console.error('Full data object:', data);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    console.log('Creating loan with data:', JSON.stringify(data, null, 2));
    console.log('Data keys:', Object.keys(data));
    console.log('Data values check:', {
      customer: data.customer,
      principalAmount: data.principalAmount,
      interestRate: data.interestRate,
      interestAmount: data.interestAmount,
      totalPayable: data.totalPayable,
      tenure: data.tenure,
      tenureUnit: data.tenureUnit,
      installmentAmount: data.installmentAmount
    });
    
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    
    const requestBody = JSON.stringify(data);
    console.log('Request body:', requestBody);
    
    const res = await fetch(`${API_URL}/loans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: requestBody
    });
    
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      let errorMessage = 'Failed to create loan';
      try {
        const err = await res.json();
        console.error('Backend error response (full):', JSON.stringify(err, null, 2));
        console.error('Backend error keys:', Object.keys(err));
        console.error('Backend error message:', err.message);
        console.error('Backend error error:', err.error);
        console.error('Backend error details:', err.details || err.errors);
        errorMessage = err.message || err.error || errorMessage;
        
        // If there are validation errors, include them
        if (err.errors) {
          const validationErrors = Object.keys(err.errors).map(key => 
            `${key}: ${err.errors[key].message || err.errors[key]}`
          ).join(', ');
          errorMessage += ` (${validationErrors})`;
        }
      } catch (e) {
        // If response is not JSON, use status text
        console.error('Failed to parse error response:', e);
        errorMessage = res.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    return res.json();
  },

  approveLoan: async (id: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/loans/${id}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to approve loan');
    return res.json();
  },

  disburseLoan: async (id: string, disbursementData: any = {}) => {
    const token = localStorage.getItem('token');
    const data = {
      disbursementMethod: disbursementData.disbursementMethod || 'Bank Transfer',
      notes: disbursementData.notes || ''
    };
    const res = await fetch(`${API_URL}/loans/${id}/disburse`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to disburse loan');
    return res.json();
  },

  rejectLoan: async (id: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/loans/${id}/reject`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to reject loan');
    return res.json();
  }
};

const customerService = {
  getAllCustomers: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch customers');
    const response = await res.json();
    return response.data || response;
  }
};

export default function LoansPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loans, setLoans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    customerId: '',
    principal: '',
    tenure: '',
    startDate: '',
    purpose: ''
  });

  useEffect(() => {
    fetchLoans();
    fetchCustomers();
  }, []);

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

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await loanService.getAllLoans();
      setLoans(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching loans:', err);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

    const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLoans();
    setRefreshing(false);
  };

useEffect(() => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('resize'));
  }
}, []);

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getAllCustomers();
      // Only show approved customers
      const approvedCustomers = Array.isArray(data) 
        ? data.filter((c: any) => c.status === 'Approved')
        : [];
      setCustomers(approvedCustomers);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setCustomers([]);
    }
  };

  const selectedCustomer = customers.find(c => c._id === formData.customerId);

  // Get filtered customers based on search term
  const filteredCustomers = customers.filter((customer: any) => {
    const searchLower = customerSearchTerm.toLowerCase();
    const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase();
    const phone = (customer.phoneNumber || '').toLowerCase();
    const customerId = (customer.customerId || '').toLowerCase();
    
    return customerName.includes(searchLower) || 
           phone.includes(searchLower) || 
           customerId.includes(searchLower);
  });

  // Check if a customer has an existing loan
  const getCustomerLoanStatus = (customerId: string) => {
    return loans.some((loan: any) => loan.customer?._id === customerId);
  };

  const calculateLoanDetails = () => {
    if (!formData.principal || !formData.tenure || !selectedCustomer) {
      return null;
    }

    const principal = parseFloat(formData.principal);
    const tenure = parseInt(formData.tenure);
    
    let interestRate = 0;
    let tenureLabel = '';
    let tenureUnit = '';
    let maxTenure = 0;
    
    switch(selectedCustomer.preferredLoanProduct) {
      case 'Monthly':
        interestRate = 25;
        tenureLabel = 'month(s)';
        tenureUnit = 'months'; // Backend expects plural: 'months', 'weeks', 'days'
        maxTenure = 6;
        break;
      case 'Weekly':
        interestRate = 27;
        tenureLabel = 'week(s)';
        tenureUnit = 'weeks'; // Backend expects plural
        maxTenure = 24;
        break;
      case 'Daily':
        interestRate = 18;
        tenureLabel = 'day(s)';
        tenureUnit = 'days'; // Backend expects plural
        maxTenure = 20;
        break;
    }

    if (tenure > maxTenure) {
      return null;
    }

    const interest = principal * (interestRate / 100);
    const totalPayable = principal + interest;
    const installmentAmount = totalPayable / tenure;
    
    let installmentLabel = '';
    switch(selectedCustomer.preferredLoanProduct) {
      case 'Monthly':
        installmentLabel = 'Monthly Payment';
        break;
      case 'Weekly':
        installmentLabel = 'Weekly Payment';
        break;
      case 'Daily':
        installmentLabel = 'Daily Payment';
        break;
    }

    let endDate = '';
    if (formData.startDate) {
      const start = new Date(formData.startDate);
      let end = new Date(start);
      
      switch(selectedCustomer.preferredLoanProduct) {
        case 'Monthly':
          end.setMonth(end.getMonth() + tenure);
          break;
        case 'Weekly':
          end.setDate(end.getDate() + (tenure * 7));
          break;
        case 'Daily':
          end.setDate(end.getDate() + tenure);
          break;
      }
      
      endDate = end.toISOString().split('T')[0];
    }

    return {
      principal,
      interestRate,
      interest,
      totalPayable,
      installmentAmount,
      installmentLabel,
      tenure,
      tenureLabel,
      tenureUnit,
      maxTenure,
      endDate
    };
  };

  const loanCalculation = calculateLoanDetails();

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'customerId') {
      setFormData(prev => ({
        ...prev,
        principal: '',
        tenure: '',
        startDate: ''
      }));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      if (!formData.customerId || !formData.principal || !formData.tenure || !formData.startDate || !formData.purpose) {
        toast.error('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      const calculation = calculateLoanDetails();
      if (!calculation || !selectedCustomer) {
        toast.error(`Tenure cannot exceed maximum allowed for ${selectedCustomer?.preferredLoanProduct} loan`);
        setSubmitting(false);
        return;
      }

      // Validate all calculation values exist and are valid
      const principalAmount = Number(calculation.principal);
      const interestRate = Number(calculation.interestRate);
      const interestAmount = Number(calculation.interest);
      const totalPayable = Number(calculation.totalPayable);
      const tenure = Number(calculation.tenure);
      const tenureUnit = String(calculation.tenureUnit);
      const installmentAmount = Number(calculation.installmentAmount);

      if (
        isNaN(principalAmount) || principalAmount <= 0 ||
        isNaN(interestRate) || interestRate <= 0 ||
        isNaN(interestAmount) || interestAmount <= 0 ||
        isNaN(totalPayable) || totalPayable <= 0 ||
        isNaN(tenure) || tenure <= 0 ||
        !tenureUnit || tenureUnit.trim() === '' ||
        isNaN(installmentAmount) || installmentAmount <= 0
      ) {
        toast.error('Error calculating loan details. Please check your inputs.');
        console.error('Invalid calculation values:', {
          principalAmount,
          interestRate,
          interestAmount,
          totalPayable,
          tenure,
          tenureUnit,
          installmentAmount
        });
        setSubmitting(false);
        return;
      }

      // Prepare loan data - ensure all fields are properly typed and present
      // Round monetary values to 2 decimal places to avoid floating point precision issues
      const loanData: Record<string, any> = {
        customer: String(formData.customerId).trim(),
        loanProduct: String(selectedCustomer.preferredLoanProduct),
        principalAmount: Math.round(principalAmount * 100) / 100,
        interestRate: Math.round(interestRate * 100) / 100,
        interestAmount: Math.round(interestAmount * 100) / 100, // Fix floating point precision
        totalPayable: Math.round(totalPayable * 100) / 100,
        tenure: Number(tenure),
        tenureUnit: String(tenureUnit).trim(),
        installmentAmount: Math.round(installmentAmount * 100) / 100,
        purpose: String(formData.purpose || 'General loan purpose').trim()
      };
      
      // Add startDate only if provided (optional field)
      if (formData.startDate && formData.startDate.trim() !== '') {
        loanData.startDate = String(formData.startDate).trim();
      }
      
      // Verify all required fields are present and valid
      const requiredFields = ['customer', 'loanProduct', 'principalAmount', 'interestRate', 'interestAmount', 'totalPayable', 'tenure', 'tenureUnit', 'installmentAmount', 'purpose'];
      const missingOrInvalid = requiredFields.filter(field => {
        const value = (loanData as any)[field];
        return value === undefined || value === null || value === '' || (typeof value === 'number' && isNaN(value));
      });
      
      if (missingOrInvalid.length > 0) {
        console.error('Invalid or missing fields before sending:', missingOrInvalid);
        console.error('Loan data:', loanData);
        toast.error(`Error: Invalid data detected. Please check: ${missingOrInvalid.join(', ')}`);
        setSubmitting(false);
        return;
      }

      // Debug: Log the data being sent
      console.log('Loan data being sent:', JSON.stringify(loanData, null, 2));
      console.log('Calculation object:', JSON.stringify(calculation, null, 2));
      console.log('All values check:', {
        principalAmount: loanData.principalAmount,
        interestRate: loanData.interestRate,
        interestAmount: loanData.interestAmount,
        totalPayable: loanData.totalPayable,
        tenure: loanData.tenure,
        tenureUnit: loanData.tenureUnit,
        installmentAmount: loanData.installmentAmount
      });

      await loanService.createLoan(loanData);
      await fetchLoans();
      setShowCreateModal(false);
      resetForm();
      toast.success('✅ Loan created successfully!');
    } catch (err: any) {
      console.error('Error creating loan:', err);
      toast.error('❌ ' + (err.message || 'Failed to create loan'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveLoan = async (loan: any) => {
    if (!confirm(`Approve loan ${loan.loanId} for ${loan.customer?.firstName} ${loan.customer?.lastName}?`)) {
      return;
    }

    try {
      await loanService.approveLoan(loan._id);
      await fetchLoans();
      toast.success('✅ Loan approved successfully!');
    } catch (err: any) {
      toast.error('❌ Failed to approve: ' + err.message);
    }
  };

  const handleDisburseLoan = async (loan: any) => {
    if (!confirm(`Disburse ${formatCurrency(loan.principalAmount)} to ${loan.customer?.firstName} ${loan.customer?.lastName}?`)) {
      return;
    }

    try {
      await loanService.disburseLoan(loan._id);
      await fetchLoans();
      toast.success('✅ Loan disbursed successfully!');
    } catch (err: any) {
      toast.error('❌ Failed to disburse: ' + err.message);
    }
  };

  const handleRejectLoan = async (loan: any) => {
    if (!confirm(`Reject loan ${loan.loanId}? This action cannot be undone.`)) {
      return;
    }

    try {
      await loanService.rejectLoan(loan._id);
      await fetchLoans();
      toast.success('✅ Loan rejected!');
    } catch (err: any) {
      toast.error('❌ Failed to reject: ' + err.message);
    }
  };

  const handleView = (loan: any) => {
    setSelectedLoan(loan);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      principal: '',
      tenure: '',
      startDate: '',
      purpose: ''
    });
    setCustomerSearchTerm('');
  };

  const exportToCSV = () => {
    const headers = ['Loan ID', 'Customer', 'Product', 'Principal', 'Total Payable', 'Status', 'Created'];
    const rows = filteredLoans.map((l: any) => [
      l.loanId,
      `${l.customer?.firstName} ${l.customer?.lastName}`,
      l.loanProduct,
      l.principalAmount,
      l.totalPayable,
      l.status,
      new Date(l.createdAt || '').toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loans-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLoans = loans.filter((loan: any) => {
    const searchLower = searchTerm.toLowerCase();
    const customerName = `${loan.customer?.firstName || ''} ${loan.customer?.lastName || ''}`.toLowerCase();
    const matchesSearch = customerName.includes(searchLower) || loan.loanId?.toLowerCase().includes(searchLower);
    const matchesStatus = filterStatus === 'all' || loan.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesProduct = filterProduct === 'all' || loan.loanProduct === filterProduct;
    return matchesSearch && matchesStatus && matchesProduct;
  });

  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLoans = filteredLoans.slice(startIndex, endIndex);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    const badges: any = {
      pending: isDarkMode ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-700 border-yellow-300',
      approved: isDarkMode ? 'bg-blue-900/30 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-700 border-blue-300',
      disbursed: isDarkMode ? 'bg-green-900/30 text-green-300 border-green-700' : 'bg-green-100 text-green-700 border-green-300',
      active: isDarkMode ? 'bg-green-900/30 text-green-300 border-green-700' : 'bg-green-100 text-green-700 border-green-300',
      overdue: isDarkMode ? 'bg-red-900/30 text-red-300 border-red-700' : 'bg-red-100 text-red-700 border-red-300',
      completed: isDarkMode ? 'bg-gray-900/30 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-700 border-gray-300',
      rejected: isDarkMode ? 'bg-red-900/30 text-red-300 border-red-700' : 'bg-red-100 text-red-700 border-red-300'
    };
    return badges[statusLower] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch(statusLower) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'disbursed': return <TrendingUp className="w-4 h-4" />;
      case 'active': return <TrendingUp className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getProductBadge = (product: string) => {
    const badges: any = {
      Monthly: isDarkMode ? 'bg-blue-900/30 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-700 border-blue-300',
      Weekly: isDarkMode ? 'bg-purple-900/30 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-700 border-purple-300',
      Daily: isDarkMode ? 'bg-green-900/30 text-green-300 border-green-700' : 'bg-green-100 text-green-700 border-green-300'
    };
    return badges[product] || (isDarkMode ? 'bg-gray-900/30 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-700 border-gray-300');
  };

  const stats = {
    totalLoans: loans.length,
    activeLoans: loans.filter((l: any) => l.status?.toLowerCase() === 'active' || l.status?.toLowerCase() === 'disbursed').length,
    pendingLoans: loans.filter((l: any) => l.status?.toLowerCase() === 'pending').length,
    completedLoans: loans.filter((l: any) => l.status?.toLowerCase() === 'completed').length,
    overdueLoans: loans.filter((l: any) => l.status?.toLowerCase() === 'overdue').length,
    totalDisbursed: loans.reduce((sum: number, l: any) => 
      (l.status?.toLowerCase() !== 'pending' && l.status?.toLowerCase() !== 'rejected') ? sum + (l.principalAmount || 0) : sum, 0),
    totalRepaid: loans.reduce((sum: number, l: any) => sum + (l.amountPaid || 0), 0),
    totalOutstanding: loans.reduce((sum: number, l: any) => 
      (l.status?.toLowerCase() === 'active' || l.status?.toLowerCase() === 'disbursed' || l.status?.toLowerCase() === 'overdue') 
        ? sum + (l.remainingBalance || 0) : sum, 0)
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${
        isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-blue-50'
      }`}>
        <div className="text-center">
          <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${
            isDarkMode ? 'text-orange-500' : 'text-blue-600'
          }`} />
          <p className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            Loading loans...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 px-1 ${
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
                Loan Management
              </h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Create, approve, and manage loan applications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`p-2.5 border rounded-xl transition-colors disabled:opacity-50 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''} ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`} />
              </button>
              <button 
                onClick={exportToCSV}
                className={`px-4 py-2.5 border rounded-xl transition-colors flex items-center gap-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Download className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Export
                </span>
              </button>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-white shadow-lg shadow-lime-600/50 rounded-lg font-semibold hover:bg-lime-600 shadow-md transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Loan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className={`rounded-2xl p-6 border shadow-sm relative overflow-hidden ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-20 ${
              isDarkMode ? 'bg-green-600' : 'bg-green-100'
            }`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Loans
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalLoans}
              </p>
            </div>
        </div>

        <div className={`rounded-2xl p-6 border shadow-sm relative overflow-hidden ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-20 ${
              isDarkMode ? 'bg-green-600' : 'bg-green-100'
            }`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Loans
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                {stats.activeLoans}
              </p>
            </div>
        </div>

        <div className={`rounded-2xl p-6 border shadow-sm relative overflow-hidden ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
 <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-20 ${
              isDarkMode ? 'bg-yellow-600' : 'bg-yellow-100'
            }`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-yellow-500 rounded-xl shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending Approval
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {stats.pendingLoans}
              </p>
            </div>
        </div>

        <div className={`rounded-2xl p-6 border shadow-sm relative overflow-hidden ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-20 ${
              isDarkMode ? 'bg-yellow-600' : 'bg-yellow-100'
            }`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-yellow-500 rounded-xl shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
               Overdue
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {stats.overdueLoans}
              </p>
            </div>
        </div>
      </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`rounded-2xl p-6 border shadow-sm ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Disbursed
              </p>
            </div>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {formatCurrency(stats.totalDisbursed)}
            </p>
          </div>

          <div className={`rounded-2xl p-6 border shadow-sm ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Repaid
              </p>
            </div>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {formatCurrency(stats.totalRepaid)}
            </p>
          </div>

          <div className={`rounded-2xl p-6 border shadow-sm ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Outstanding
              </p>
            </div>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
              {formatCurrency(stats.totalOutstanding)}
            </p>
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
                placeholder="Search by customer name or loan ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="disbursed">Disbursed</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className={`px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Products</option>
              <option value="Monthly">Monthly (25%)</option>
              <option value="Weekly">Weekly (27%)</option>
              <option value="Daily">Daily (18%)</option>
            </select>
          </div>
        </div>

             {/* Loans Table */}
        <div className={`rounded-2xl border overflow-hidden shadow-sm ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${
                isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Loan ID</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Customer</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Product</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Principal</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Total Payable</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Outstanding</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Tenure</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Status</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {currentLoans.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <Wallet className={`w-16 h-16 mx-auto mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-300'
                      }`} />
                      <p className={`text-lg mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No loans found
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {loans.length === 0 
                          ? 'Click "Create Loan" to start' 
                          : 'Try adjusting your search or filters'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentLoans.map((loan: any) => (
                    <tr key={loan._id} className={`transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>{loan.loanId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className={`text-sm font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {loan.customer?.firstName} {loan.customer?.lastName}
                          </span>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {loan.customer?.customerId}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getProductBadge(loan.loanProduct)}`}>
                          {loan.loanProduct}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{formatCurrency(loan.principalAmount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(loan.totalPayable)}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {loan.interestRate}% interest
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${
                          isDarkMode ? 'text-orange-400' : 'text-orange-600'
                        }`}>
                          {formatCurrency(loan.remainingBalance || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs">
                          <p className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {loan.tenure} {loan.loanProduct === 'Monthly' ? 'months' : loan.loanProduct === 'Weekly' ? 'weeks' : 'days'}
                          </p>
                          {loan.startDate && (
                            <p className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>
                              {new Date(loan.startDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(loan.status)}`}>
                          {getStatusIcon(loan.status)}
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleView(loan)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode 
                                ? 'text-blue-400 hover:bg-blue-900/30' 
                                : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {loan.status?.toLowerCase() === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApproveLoan(loan)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDarkMode 
                                    ? 'text-green-400 hover:bg-green-900/30' 
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                                title="Approve Loan"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleRejectLoan(loan)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDarkMode 
                                    ? 'text-red-400 hover:bg-red-900/30' 
                                    : 'text-red-600 hover:bg-red-50'
                                }`}
                                title="Reject Loan"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {(loan.status === 'Approved' || loan.status?.toLowerCase() === 'approved') && (
                            <button 
                              onClick={() => handleDisburseLoan(loan)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode 
                                  ? 'text-purple-400 hover:bg-purple-900/30' 
                                  : 'text-purple-600 hover:bg-purple-50'
                              }`}
                              title="Disburse Loan"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
 {filteredLoans.length > 0 && (
            <div className={`px-6 py-4 border-t flex items-center justify-between ${
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(endIndex, filteredLoans.length)}</span> of{' '}
                <span className="font-semibold">{filteredLoans.length}</span> loans
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-300 hover:bg-white'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className={`px-4 py-2 text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-300 hover:bg-white'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

      {/* Create Loan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-5xl max-h-[100vh] flex flex-col shadow-2xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`border-b px-6 py-4 flex items-center justify-between shrink-0 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create New Loan</h2>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select approved customer and enter loan details</p>
              </div>
              <button 
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              <div className={`rounded-xl p-6 border ${
                isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-blue-50 border-blue-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Step 1: Select Customer</h3>
                {customers.length === 0 ? (
                 <div className={`border rounded-lg p-4 text-center ${
                  isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <AlertCircle className={`w-12 h-12 mx-auto mb-2 ${
                    isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                  <p className="font-medium text-yellow-800">No approved customers available</p>
                  <p className="font-medium text-yellow-800">Please approve customers first before creating loans</p>
                </div>
                ) : (
                  <div className={`${isDarkMode ? 'space-y-3' : 'space-y-3'}`}>
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by name, phone, or customer ID..."
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        disabled={submitting}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Dropdown with filtered options */}
                    <select
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleInputChange}
                      disabled={submitting}
                      className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100`}
                    >
                      <option value="">Choose a customer...</option>
                      {filteredCustomers.map((customer: any) => {
                        const hasLoan = getCustomerLoanStatus(customer._id);
                        const loanIndicator = hasLoan ? '🟢' : '⚪';
                        return (
                          <option key={customer._id} value={customer._id}>
                            {loanIndicator} {customer.firstName} {customer.lastName} ({customer.customerId}) | {customer.phoneNumber} | {customer.preferredLoanProduct} | {customer.customerType}
                          </option>
                        );
                      })}
                    </select>

                    {/* Results count */}
                    <p className={`${isDarkMode ? 'text-xs text-gray-400' : 'text-xs text-gray-600'}`}>
                      Showing {filteredCustomers.length} of {customers.length} customers
                      {customerSearchTerm && ` (Filtered by "${customerSearchTerm}")`}
                    </p>
                  </div>
                )}
              </div>

              {selectedCustomer && (
                <>
                  <div className={`rounded-lg p-4 border ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <h4 className="font-semibold mb-2">Customer Loan Product</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Product</p>
                      <p className="font-bold">{selectedCustomer.preferredLoanProduct}</p>
                      </div>
                      <div>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Interest Rate</p>
                        <p className="font-bold text-gray-900">
                          {selectedCustomer.preferredLoanProduct === 'Monthly' ? '25%' : 
                           selectedCustomer.preferredLoanProduct === 'Weekly' ? '27%' : '18%'}
                        </p>
                      </div>
                      <div>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Max Tenure</p>
                        <p className="font-bold text-gray-900">
                          {selectedCustomer.preferredLoanProduct === 'Monthly' ? '6 months' : 
                           selectedCustomer.preferredLoanProduct === 'Weekly' ? '24 weeks' : '20 days'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Step 2: Loan Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-700'
                        }`}>
                          Principal Amount (₦) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="principal"
                          value={formData.principal}
                          onChange={handleInputChange}
                          disabled={submitting}
                          className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300'
                          }`}
                          placeholder="Enter amount"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-700'
                        }`}>
                          Tenure <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="tenure"
                          value={formData.tenure}
                          onChange={handleInputChange}
                          disabled={submitting}
                          className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300'
                          }`}
                          placeholder={
                            selectedCustomer.preferredLoanProduct === 'Monthly' ? '1-6 months' :
                            selectedCustomer.preferredLoanProduct === 'Weekly' ? '1-24 weeks' :
                            '1-20 days'
                          }
                          min="1"
                          max={
                            selectedCustomer.preferredLoanProduct === 'Monthly' ? 6 :
                            selectedCustomer.preferredLoanProduct === 'Weekly' ? 24 : 20
                          }
                        />
                      </div>

                      <div>
                        <label className={`${isDarkMode ? 'block text-sm font-medium text-white mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}`}>
                          Start Date <span className={`${isDarkMode ? 'text-red-500' : 'text-red-500'}`}>*</span>
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          disabled={submitting}
                          className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-700'
                        }`}>
                      Loan Purpose <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      disabled={submitting}
                      rows={3}
                      className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 placeholder-gray-400`}
                      placeholder="Enter the purpose of this loan..."
                    />
                  </div>

                  {loanCalculation && (
                    <div className={`${isDarkMode ? 'bg-green-900 border-2 border-green-700' : 'bg-green-50 border-2 border-green-200'} rounded-lg p-6`}>
                      <h3 className={`text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Loan Calculation Summary
                      </h3>
                      <div className={`${isDarkMode ? 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-4' : 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'}`}>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Principal</p>
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(loanCalculation.principal)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Interest ({loanCalculation.interestRate}%)</p>
                          <p className="text-lg font-bold text-orange-600">{formatCurrency(loanCalculation.interest)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Total Payable</p>
                          <p className="text-lg font-bold text-blue-600">{formatCurrency(loanCalculation.totalPayable)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">{loanCalculation.installmentLabel}</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(loanCalculation.installmentAmount)}
                          </p>
                        </div>
                      </div>
                      
                      {loanCalculation.endDate && (
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Loan Period</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {formData.startDate} to {loanCalculation.endDate}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600 mb-1">Duration</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {loanCalculation.tenure} {loanCalculation.tenureLabel}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => { setShowCreateModal(false); resetForm(); }}
                      disabled={submitting}
                      className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-white shadow-lg shadow-lime-600/50 rounded-lg font-semibold hover:bg-lime-600 shadow-md transition-colors"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Loan'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Loan Modal */}
      {showViewModal && selectedLoan && (
        <div className={`${isDarkMode ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4' : 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'}`}>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
            <div className={`${isDarkMode ? 'sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between z-10' : 'sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10'}`}>
              <div>
                <h2 className={`${isDarkMode ? 'text-xl font-bold text-white' : 'text-xl font-bold text-gray-900'}`}>Loan Details</h2>
                <p className="text-sm text-white mt-1">{selectedLoan.loanId}</p>
              </div>
              <button 
                onClick={() => setShowViewModal(false)}
                className={`${isDarkMode ? 'p-2 hover:bg-lime-500 text-white rounded-lg transition-colors' : 'p-2 hover:bg-gray-100 rounded-lg transition-colors'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                <h3 className={`${isDarkMode ? 'font-semibold text-white mb-3' : 'font-semibold text-gray-900 mb-3'}`}>Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name:</span> <span className={`${isDarkMode ? 'font-medium' : 'font-medium'}`}>{selectedLoan.customer?.firstName} {selectedLoan.customer?.lastName}</span></div>
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Customer ID:</span> <span className="font-medium">{selectedLoan.customer?.customerId}</span></div>
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone:</span> <span className="font-medium">{selectedLoan.customer?.phoneNumber}</span></div>
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type:</span> <span className="font-medium">{selectedLoan.customer?.customerType}</span></div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                <h3 className={`${isDarkMode ? 'font-semibold text-white mb-3' : 'font-semibold text-gray-900 mb-3'}`}>Loan Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Product:</span> <span className="font-medium">{selectedLoan.loanProduct}</span></div>
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Interest Rate:</span> <span className="font-medium">{selectedLoan.interestRate}%</span></div>
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Principal:</span> <span className="font-medium">{formatCurrency(selectedLoan.principalAmount)}</span></div>
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Interest:</span> <span className="font-medium">{formatCurrency(selectedLoan.interestAmount)}</span></div>
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Payable:</span> <span className="font-medium">{formatCurrency(selectedLoan.totalAmount)}</span></div>
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Installment:</span> <span className="font-medium">{formatCurrency(selectedLoan.installmentAmount)}</span></div>
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tenure:</span> <span className="font-medium">{selectedLoan.tenure} {selectedLoan.loanProduct === 'Monthly' ? 'months' : selectedLoan.loanProduct === 'Weekly' ? 'weeks' : 'days'}</span></div>
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span> <span className={`font-semibold ${selectedLoan.status?.toLowerCase() === 'active' || selectedLoan.status?.toLowerCase() === 'disbursed' ? 'text-green-600' : selectedLoan.status?.toLowerCase() === 'pending' ? 'text-yellow-600' : selectedLoan.status?.toLowerCase() === 'completed' ? 'text-gray-600' : 'text-red-600'}`}>{selectedLoan.status}</span></div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                <h3 className={`${isDarkMode ? 'font-semibold text-white mb-3' : 'font-semibold text-gray-900 mb-3'}`}>Payment Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Amount Paid:</span> <span className="font-medium text-green-600">{formatCurrency(selectedLoan.amountPaid || 0)}</span></div>
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Outstanding:</span> <span className="font-medium text-orange-600">{formatCurrency(selectedLoan.outstandingBalance || 0)}</span></div>
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Start Date:</span> <span className="font-medium">{selectedLoan.startDate ? new Date(selectedLoan.startDate).toLocaleDateString() : 'N/A'}</span></div>
                  <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>End Date:</span> <span className="font-medium">{selectedLoan.endDate ? new Date(selectedLoan.endDate).toLocaleDateString() : 'N/A'}</span></div>
                  {selectedLoan.disbursedDate && (
                    <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Disbursed:</span> <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(selectedLoan.disbursedDate).toLocaleDateString()}</span></div>
                  )}
                  {selectedLoan.approvedDate && (
                    <div><span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Approved:</span> <span className="font-medium">{new Date(selectedLoan.approvedDate).toLocaleDateString()}</span></div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Created:</span> {new Date(selectedLoan.createdAt).toLocaleDateString()} at {new Date(selectedLoan.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}