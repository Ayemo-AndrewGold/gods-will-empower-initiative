

"use client";

import { useState, useEffect } from 'react';
import { Users, Search, Plus, Trash2, Eye, UserCheck, Phone, Mail, X, Download, ChevronLeft, ChevronRight, Printer, CreditCard, UserPlus, Trash, Loader2, AlertCircle, Briefcase, CheckCircle, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('234')) {
    cleaned = '234' + cleaned;
  }
  return cleaned;
};

interface GroupMember {
  name: string;
  phoneNumber: string;
  relationship: string;
}

interface UnionContact {
  name: string;
  phoneNumber: string;
  address: string;
}

interface NextOfKin extends UnionContact {
  relationship?: string;
}

interface FormDataType {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  customerType: string;
  preferredLoanProduct: string;
  groupName: string;
  unionLeader: UnionContact;
  unionSecretary: UnionContact;
  groupMembers: GroupMember[];
  idType: string;
  idNumber: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
  nextOfKin: NextOfKin;
  notes: string;
}

const customerService = {
  getAllCustomers: async (): Promise<any> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/customers`, { 
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch customers');
    const response = await res.json();
    return response.data || response;
  },
  
  registerCustomer: async (data: any): Promise<any> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to register customer');
    }
    return res.json();
  },

  approveCustomer: async (id: string): Promise<any> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/customers/${id}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to approve customer');
    return res.json();
  },

  rejectCustomer: async (id: string): Promise<any> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/customers/${id}/reject`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to reject customer');
    return res.json();
  },
  
  deleteCustomer: async (id: string): Promise<any> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete customer');
    return res.json();
  }
};

export default function CustomersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const itemsPerPage = 10;

  const initialForm: FormDataType = {
    firstName: '', lastName: '', phoneNumber: '', email: '', address: '',
    dateOfBirth: '', gender: '', customerType: '', preferredLoanProduct: '',
    groupName: '', unionLeader: { name: '', phoneNumber: '', address: '' },
    unionSecretary: { name: '', phoneNumber: '', address: '' }, groupMembers: [],
    idType: '', idNumber: '', businessName: '', businessType: '', businessAddress: '',
    nextOfKin: { name: '', relationship: '', phoneNumber: '', address: '' }, notes: ''
  };

  const [formData, setFormData] = useState<FormDataType>(initialForm);

  useEffect(() => { 
    fetchCustomers(); 
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAllCustomers();
      console.log('All customers fetched:', data);
      // Show all customers - let the status filter handle display
      const allCustomers = Array.isArray(data) ? data : [];
      console.log('All customers loaded:', allCustomers);
      setCustomers(allCustomers);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCustomer = async (customer: any) => {
    if (!confirm(`Approve customer ${customer.firstName} ${customer.lastName}?`)) {
      return;
    }

    try {
      await customerService.approveCustomer(customer._id);
      await fetchCustomers();
      alert('✅ Customer approved successfully!');
    } catch (err: any) {
      alert('❌ Failed to approve: ' + err.message);
    }
  };

  const handleRejectCustomer = async (customer: any) => {
    if (!confirm(`Reject customer ${customer.firstName} ${customer.lastName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await customerService.rejectCustomer(customer._id);
      await fetchCustomers();
      alert('✅ Customer rejected!');
    } catch (err: any) {
      alert('❌ Failed to reject: ' + err.message);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ 
        ...prev, 
        [parent]: { 
          ...(prev[parent as keyof typeof prev] as any), 
          [child]: value 
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name === 'preferredLoanProduct') {
      setFormData(prev => ({ 
        ...prev, 
        customerType: '', 
        unionLeader: { name: '', phoneNumber: '', address: '' }, 
        unionSecretary: { name: '', phoneNumber: '', address: '' }, 
        groupMembers: [] 
      }));
    }
    
    if (name === 'customerType' && value === 'Individual') {
      setFormData(prev => ({ 
        ...prev, 
        groupName: '', 
        unionLeader: { name: '', phoneNumber: '', address: '' }, 
        unionSecretary: { name: '', phoneNumber: '', address: '' }, 
        groupMembers: [] 
      }));
    }
  };

  const addGroupMember = () => {
    setFormData(prev => ({ 
      ...prev, 
      groupMembers: [...prev.groupMembers, { name: '', phoneNumber: '', relationship: 'Member' }] 
    }));
  };

  const removeGroupMember = (idx: number) => {
    setFormData(prev => ({ 
      ...prev, 
      groupMembers: prev.groupMembers.filter((_: any, i: number) => i !== idx) 
    }));
  };

  const updateGroupMember = (idx: number, field: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      groupMembers: prev.groupMembers.map((m: any, i: number) => 
        i === idx ? { ...m, [field]: value } : m
      ) 
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      if (!formData.firstName || !formData.lastName || !formData.phoneNumber || 
          !formData.address || !formData.preferredLoanProduct || !formData.customerType) {
        alert('Please fill in all required fields (*)');
        setSubmitting(false);
        return;
      }

      if (formData.preferredLoanProduct === 'Weekly' && formData.customerType !== 'Group') {
        alert('Weekly Product must be Group type');
        setSubmitting(false);
        return;
      }

      if (formData.customerType === 'Group') {
        if (!formData.groupName) {
          alert('Please enter Group Name');
          setSubmitting(false);
          return;
        }
        if (!formData.unionLeader.name || !formData.unionLeader.phoneNumber || !formData.unionLeader.address) {
          alert('Please complete Union Leader information');
          setSubmitting(false);
          return;
        }
        if (formData.preferredLoanProduct === 'Weekly' && 
            (!formData.unionSecretary.name || !formData.unionSecretary.phoneNumber || !formData.unionSecretary.address)) {
          alert('Weekly Product requires complete Union Secretary information');
          setSubmitting(false);
          return;
        }
        if (formData.groupMembers.length === 0) {
          alert('Please add at least one group member');
          setSubmitting(false);
          return;
        }
        const invalidMember = formData.groupMembers.find((m: any) => !m.name || !m.phoneNumber || !m.relationship);
        if (invalidMember) {
          alert('Please complete all group member information');
          setSubmitting(false);
          return;
        }
      }

      const customerData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: normalizePhoneNumber(formData.phoneNumber),
        address: formData.address.trim(),
        customerType: formData.customerType,
        preferredLoanProduct: formData.preferredLoanProduct,
      };

      if (formData.email) customerData.email = formData.email.trim();
      if (formData.dateOfBirth) customerData.dateOfBirth = formData.dateOfBirth;
      if (formData.gender) customerData.gender = formData.gender;
      if (formData.idType) customerData.idType = formData.idType;
      if (formData.idNumber) customerData.idNumber = formData.idNumber.trim();
      if (formData.businessName) customerData.businessName = formData.businessName.trim();
      if (formData.businessType) customerData.businessType = formData.businessType.trim();
      if (formData.businessAddress) customerData.businessAddress = formData.businessAddress.trim();
      if (formData.notes) customerData.notes = formData.notes.trim();

      if (formData.customerType === 'Group') {
        customerData.groupName = formData.groupName.trim();
        customerData.unionLeader = {
          ...formData.unionLeader,
          phoneNumber: normalizePhoneNumber(formData.unionLeader.phoneNumber)
        };
        if (formData.preferredLoanProduct === 'Weekly') {
          customerData.unionSecretary = {
            ...formData.unionSecretary,
            phoneNumber: normalizePhoneNumber(formData.unionSecretary.phoneNumber)
          };
        }
        customerData.groupMembers = formData.groupMembers.map(member => ({
          ...member,
          phoneNumber: normalizePhoneNumber(member.phoneNumber)
        }));
      }

      if (formData.nextOfKin.name) {
        customerData.nextOfKin = {
          ...formData.nextOfKin,
          phoneNumber: normalizePhoneNumber(formData.nextOfKin.phoneNumber)
        };
      }

      await customerService.registerCustomer(customerData);
      await fetchCustomers();
      setShowAddModal(false);
      resetForm();
      alert('✅ Customer registered successfully!');
    } catch (err: any) {
      console.error('Registration error:', err);
      alert('❌ ' + (err.message || 'Failed to create customer'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (customer: any) => {
    if (!confirm(`Delete ${customer.firstName} ${customer.lastName}? This action cannot be undone.`)) return;
    
    try {
      await customerService.deleteCustomer(customer._id);
      await fetchCustomers();
      alert('✅ Customer deleted successfully!');
    } catch (err: any) {
      alert('❌ Failed to delete: ' + err.message);
    }
  };

  const handleView = (customer: any) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData(initialForm);
    setActiveTab('basic');
  };

  const getAvailableLoanTypes = () => {
    if (formData.preferredLoanProduct === 'Monthly') return ['Individual'];
    if (formData.preferredLoanProduct === 'Weekly') return ['Group'];
    if (formData.preferredLoanProduct === 'Daily') return ['Individual', 'Group'];
    return [];
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Type', 'Product', 'Status'];
    const rows = filteredCustomers.map((c: any) => [
      c.customerId, 
      `${c.firstName} ${c.lastName}`, 
      c.phoneNumber, 
      c.email || '', 
      c.customerType, 
      c.preferredLoanProduct, 
      c.status
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCustomers = customers.filter((customer: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      customer.firstName?.toLowerCase().includes(searchLower) || 
      customer.lastName?.toLowerCase().includes(searchLower) || 
      customer.phoneNumber?.includes(searchTerm) || 
      customer.customerId?.toLowerCase().includes(searchLower) || 
      customer.email?.toLowerCase().includes(searchLower);
    const matchesProduct = filterProduct === 'all' || customer.preferredLoanProduct === filterProduct;
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesProduct && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const getProductBadge = (product: string) => {
    const badges: any = {
      Monthly: 'bg-blue-100 text-blue-700 border-blue-300',
      Weekly: 'bg-purple-100 text-purple-700 border-purple-300',
      Daily: 'bg-green-100 text-green-700 border-green-300'
    };
    return badges[product] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      Approved: 'bg-green-100 text-green-700 border-green-300',
      Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Rejected: 'bg-red-100 text-red-700 border-red-300'
    };
    return badges[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading customers...</p>
        </div>
      </div>
    );
  }

  const showGroupFields = formData.customerType === 'Group';
  const showSecretaryFields = formData.preferredLoanProduct === 'Weekly' && showGroupFields;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
            <p className="text-gray-600">Register and manage individual and group customers</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportToCSV} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />Export CSV
            </button>
            <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2">
              <Printer className="w-4 h-4" />Print
            </button>
             <button 
             onClick={() => setShowAddModal(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Customer
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Individual</p>
              <p className="text-3xl font-bold text-green-600">{customers.filter((c: any) => c.customerType === 'Individual').length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Groups</p>
              <p className="text-3xl font-bold text-purple-600">{customers.filter((c: any) => c.customerType === 'Group').length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
              <p className="text-3xl font-bold text-orange-600">{customers.filter((c: any) => c.status === 'Pending').length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input type="text" placeholder="Search by name, phone, email, or customer ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="all">All Products</option>
            <option value="Monthly">Monthly (25%)</option>
            <option value="Weekly">Weekly (27%)</option>
            <option value="Daily">Daily (18%)</option>
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Group Info</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No customers found</p>
                    <p className="text-gray-400 text-sm">{customers.length === 0 ? 'Click "Add Customer" to register your first customer' : 'Try adjusting your search or filters'}</p>
                  </td>
                </tr>
              ) : (
                currentCustomers.map((customer: any) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><span className="text-sm font-bold text-blue-600">{customer.customerId}</span></td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{customer.firstName} {customer.lastName}</p>
                        {customer.groupName && <p className="text-xs text-purple-600 mt-0.5">📋 {customer.groupName}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-900"><Phone className="w-3.5 h-3.5" />{customer.phoneNumber}</div>
                        {customer.email && <div className="flex items-center gap-1.5 text-gray-600"><Mail className="w-3.5 h-3.5" />{customer.email}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${customer.customerType === 'Group' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{customer.customerType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getProductBadge(customer.preferredLoanProduct)}`}>{customer.preferredLoanProduct}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(customer.status)}`}>{customer.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      {customer.customerType === 'Group' ? (
                        <div className="text-xs space-y-1">
                          <div className="font-semibold text-gray-900">👤 {customer.unionLeader?.name}</div>
                          {customer.unionSecretary && <div className="text-gray-600">📝 {customer.unionSecretary.name}</div>}
                          {customer.groupMembers && customer.groupMembers.length > 0 && (
                            <div className="text-purple-600 font-semibold">👥 {customer.groupMembers.length} Member{customer.groupMembers.length !== 1 ? 's' : ''}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleView(customer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        {customer.status === 'Pending' && (
                          <>
                            <button onClick={() => handleApproveCustomer(customer)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve Customer">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleRejectCustomer(customer)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Reject Customer">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDelete(customer)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete Customer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, filteredCustomers.length)}</span> of <span className="font-semibold">{filteredCustomers.length}</span> customers
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm font-medium">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add New Customer</h2>
                <p className="text-sm text-gray-600 mt-1">Register individual or group customer</p>
              </div>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} disabled={submitting} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />Step 1: Select Loan Product
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Monthly', rate: '25%', tenure: 'Up to 6 months', type: 'Individual Only', color: 'blue' },
                    { name: 'Weekly', rate: '27%', tenure: 'Up to 24 weeks', type: 'Group Only', extra: 'Leader + Secretary', color: 'purple' },
                    { name: 'Daily', rate: '18%', tenure: 'Max 20 days', type: 'Individual/Group', extra: 'Group = Leader only', color: 'green' }
                  ].map(product => (
                    <div key={product.name} onClick={() => !submitting && handleInputChange({ target: { name: 'preferredLoanProduct', value: product.name }} as any)} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.preferredLoanProduct === product.name ? 'border-blue-500 bg-white shadow-md' : 'border-gray-300 hover:border-blue-300 bg-white'} ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">{product.name} {product.name === 'Weekly' ? 'Product' : 'Loan'}</h4>
                        <input type="radio" checked={formData.preferredLoanProduct === product.name} readOnly className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Interest: <span className="font-semibold text-blue-600">{product.rate}</span></p>
                        <p>Tenure: {product.tenure}</p>
                        <p className="font-semibold text-gray-800">{product.type}</p>
                        {product.extra && <p className="text-xs text-blue-700">{product.extra}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                {formData.preferredLoanProduct && getAvailableLoanTypes().length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Select Type <span className="text-red-500">*</span></label>
                    <div className="flex gap-4">
                      {getAvailableLoanTypes().map(type => (
                        <label key={type} className={`flex items-center gap-2 cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-400 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <input type="radio" name="customerType" value={type} checked={formData.customerType === type} onChange={handleInputChange} disabled={submitting} className="w-4 h-4" />
                          <span className="text-sm font-medium text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-200">
                <div className="flex gap-1">
                  {[{ id: 'basic', label: 'Basic Info', icon: Users }, { id: 'business', label: 'Business & ID', icon: Briefcase }, { id: 'kin', label: 'Next of Kin', icon: UserCheck }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                      <tab.icon className="w-4 h-4" />{tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{formData.customerType === 'Group' ? 'Group Leader Information' : 'Customer Information'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="Enter first name" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="Enter last name" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="09055883010" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="customer@example.com" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Gender</label><select name="gender" value={formData.gender} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"><option value="">Select gender</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Address <span className="text-red-500">*</span></label><input type="text" name="address" value={formData.address} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="Enter full address" /></div>
                        {formData.customerType === 'Group' && (<div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Group Name <span className="text-red-500">*</span></label><input type="text" name="groupName" value={formData.groupName} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="Enter group name" /></div>)}
                      </div>
                    </div>

                    {showGroupFields && (
                      <>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Union Leader {showSecretaryFields ? '& Secretary' : ''}</h3>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div><label className="block text-sm font-medium text-gray-700 mb-2">Leader Name <span className="text-red-500">*</span></label><input type="text" name="unionLeader.name" value={formData.unionLeader.name} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" placeholder="Enter leader name" /></div>
                              <div><label className="block text-sm font-medium text-gray-700 mb-2">Leader Phone <span className="text-red-500">*</span></label><input type="tel" name="unionLeader.phoneNumber" value={formData.unionLeader.phoneNumber} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" placeholder="09055883010" /></div>
                              <div><label className="block text-sm font-medium text-gray-700 mb-2">Leader Address <span className="text-red-500">*</span></label><input type="text" name="unionLeader.address" value={formData.unionLeader.address} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" placeholder="Enter leader address" /></div>
                            </div>
                            {showSecretaryFields && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-purple-200">
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Secretary Name <span className="text-red-500">*</span></label><input type="text" name="unionSecretary.name" value={formData.unionSecretary.name} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" placeholder="Enter secretary name" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Secretary Phone <span className="text-red-500">*</span></label><input type="tel" name="unionSecretary.phoneNumber" value={formData.unionSecretary.phoneNumber} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" placeholder="09055883010" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Secretary Address <span className="text-red-500">*</span></label><input type="text" name="unionSecretary.address" value={formData.unionSecretary.address} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" placeholder="Enter secretary address" /></div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div><h3 className="text-lg font-semibold text-gray-900">Group Members</h3><p className="text-sm text-gray-600 mt-1">Add all members (minimum 1 required)</p></div>
                            <button onClick={addGroupMember} disabled={submitting} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"><UserPlus className="w-4 h-4" />Add Member</button>
                          </div>
                          {formData.groupMembers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500"><Users className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>No members added yet. Click "Add Member" to start.</p></div>
                          ) : (
                            <div className="space-y-4">
                              {formData.groupMembers.map((member: any, index: number) => (
                                <div key={index} className="bg-white border border-gray-300 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-gray-900">Member {index + 1}</h4>
                                    <button onClick={() => removeGroupMember(index)} disabled={submitting} className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"><Trash className="w-4 h-4" /></button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label><input type="text" value={member.name} onChange={(e) => updateGroupMember(index, 'name', e.target.value)} disabled={submitting} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100" placeholder="Enter name" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label><input type="tel" value={member.phoneNumber} onChange={(e) => updateGroupMember(index, 'phoneNumber', e.target.value)} disabled={submitting} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100" placeholder="09055883010" /></div>
                                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Relationship <span className="text-red-500">*</span></label><input type="text" value={member.relationship} onChange={(e) => updateGroupMember(index, 'relationship', e.target.value)} disabled={submitting} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100" placeholder="Member" /></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'business' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Business & Identification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label><select name="idType" value={formData.idType} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"><option value="">Select ID type</option><option value="National ID">National ID</option><option value="Voter Card">Voter Card</option><option value="Driver's License">Driver's License</option><option value="Passport">Passport</option></select></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label><input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="Enter ID number" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label><input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="Enter business name" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label><input type="text" name="businessType" value={formData.businessType} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="e.g., Retail, Services" /></div>
                      <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label><input type="text" name="businessAddress" value={formData.businessAddress} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="Enter business address" /></div>
                      <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Notes</label><textarea name="notes" value={formData.notes} onChange={handleInputChange} disabled={submitting} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="Additional notes about the customer"></textarea></div>
                    </div>
                  </div>
                )}

                {activeTab === 'kin' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Next of Kin Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label><input type="text" name="nextOfKin.name" value={formData.nextOfKin.name} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="Enter next of kin name" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label><input type="text" name="nextOfKin.relationship" value={formData.nextOfKin.relationship} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="e.g., Spouse, Sibling" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label><input type="tel" name="nextOfKin.phoneNumber" value={formData.nextOfKin.phoneNumber} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="09055883010" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-2">Address</label><input type="text" name="nextOfKin.address" value={formData.nextOfKin.address} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="Enter next of kin address" /></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">{showGroupFields && <span className="font-medium">Total Members: {formData.groupMembers.length}</span>}</div>
                <div className="flex items-center gap-3">
                  <button onClick={() => { setShowAddModal(false); resetForm(); }} disabled={submitting} className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                  <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">{submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Adding...</>) : 'Add Customer'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div><h2 className="text-xl font-bold text-gray-900">Customer Details</h2><p className="text-sm text-gray-600 mt-1">{selectedCustomer.customerId}</p></div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4"><h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3><div className="grid grid-cols-2 gap-4 text-sm"><div><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</span></div><div><span className="text-gray-600">Phone:</span> <span className="font-medium">{selectedCustomer.phoneNumber}</span></div>{selectedCustomer.email && <div><span className="text-gray-600">Email:</span> <span className="font-medium">{selectedCustomer.email}</span></div>}<div><span className="text-gray-600">Address:</span> <span className="font-medium">{selectedCustomer.address}</span></div></div></div>
              {selectedCustomer.customerType === 'Group' && selectedCustomer.groupMembers && selectedCustomer.groupMembers.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4"><h3 className="font-semibold text-gray-900 mb-3">Group Members ({selectedCustomer.groupMembers.length})</h3><div className="space-y-2">{selectedCustomer.groupMembers.map((member: any, idx: number) => (<div key={idx} className="bg-white rounded p-2"><p className="font-medium">{member.name}</p><p className="text-xs text-gray-600">{member.phoneNumber} • {member.relationship}</p></div>))}</div></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}