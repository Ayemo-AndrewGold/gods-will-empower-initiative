// src/services/customerService.ts - Customer API calls
import api from './api';

export interface Customer {
  _id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female';
  customerType: 'Individual' | 'Group';
  preferredLoanProduct: 'Monthly' | 'Weekly' | 'Daily';
  groupName?: string;
  unionLeader?: {
    name: string;
    phoneNumber: string;
    address: string;
  };
  unionSecretary?: {
    name: string;
    phoneNumber: string;
    address: string;
  };
  groupMembers?: Array<{
    name: string;
    phoneNumber: string;
    relationship: string;
  }>;
  idType?: string;
  idNumber?: string;
  businessName?: string;
  businessType?: string;
  businessAddress?: string;
  nextOfKin?: {
    name: string;
    relationship: string;
    phoneNumber: string;
    address: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  registeredBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female';
  customerType: 'Individual' | 'Group';
  preferredLoanProduct: 'Monthly' | 'Weekly' | 'Daily';
  groupName?: string;
  unionLeader?: {
    name: string;
    phoneNumber: string;
    address: string;
  };
  unionSecretary?: {
    name: string;
    phoneNumber: string;
    address: string;
  };
  groupMembers?: Array<{
    name: string;
    phoneNumber: string;
    relationship: string;
  }>;
  idType?: string;
  idNumber?: string;
  businessName?: string;
  businessType?: string;
  businessAddress?: string;
  nextOfKin?: {
    name: string;
    relationship: string;
    phoneNumber: string;
    address: string;
  };
  notes?: string;
}

class CustomerService {
  // Register new customer
  async registerCustomer(customerData: CreateCustomerData): Promise<Customer> {
    const response = await api.post('/customers', customerData);
    return response.data.data;
  }

  // Get all customers
  async getAllCustomers(params?: { status?: string; customerType?: string; loanProduct?: string }): Promise<Customer[]> {
    const response = await api.get('/customers', { params });
    return response.data.data;
  }

  // Get single customer
  async getCustomer(id: string): Promise<Customer> {
    const response = await api.get(`/customers/${id}`);
    return response.data.data;
  }

  // Update customer
  async updateCustomer(id: string, customerData: Partial<CreateCustomerData>): Promise<Customer> {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data.data;
  }

  // Approve customer (Admin only)
  async approveCustomer(id: string): Promise<Customer> {
    const response = await api.put(`/customers/${id}/approve`);
    return response.data.data;
  }

  // Reject customer (Admin only)
  async rejectCustomer(id: string, reason: string): Promise<Customer> {
    const response = await api.put(`/customers/${id}/reject`, { rejectionReason: reason });
    return response.data.data;
  }

  // Delete customer (Admin only)
  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  }

  // Get customer statistics (Admin only)
  async getCustomerStats(): Promise<any> {
    const response = await api.get('/customers/stats/summary');
    return response.data.data;
  }
}

export default new CustomerService();