// src/services/authService.ts - Authentication API calls
import api from './api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Admin' | 'Loan Officer';
  staffId: string;
  phoneNumber?: string;
  branch?: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'Admin' | 'Loan Officer';
  phoneNumber: string;
  branch?: string;
}

class AuthService {
  // Login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials);
    
    // Save token and user to localStorage
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  // Logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data;
  }

  // Register new user (Admin only)
  async register(userData: RegisterData): Promise<any> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  // Get all users (Admin only)
  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/auth/users');
    return response.data.data;
  }

  // Update profile
  async updateProfile(data: { firstName: string; lastName: string; phoneNumber: string }): Promise<User> {
    const response = await api.put('/auth/update-profile', data);
    
    // Update user in localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...user, ...response.data.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return response.data.data;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }

  // Toggle user status (Admin only)
  async toggleUserStatus(userId: string): Promise<any> {
    const response = await api.put(`/auth/users/${userId}/toggle-status`);
    return response.data;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Get user from localStorage
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'Admin';
  }
}

export default new AuthService();
