import { User } from '../types';
import * as api from './api';
// Use the shared api client; token is now handled by interceptor
import apiClient from './api';

export const register = async (email: string, password?: string): Promise<User> => {
  if (!email || !password) {
    throw new Error('Email and password are required for registration.');
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new Error('Please enter a valid email address.');
  }
  if (password.length < 6) { // Simple password policy for demo
    throw new Error('Password must be at least 6 characters long.');
  }

  try {
    const user = await api.authService.register(email, password);
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Registration failed. Please try again.');
  }
};

export const login = async (email: string, password?: string): Promise<User> => {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  try {
    const user = await api.authService.login(email, password);
    // Token is stored by api.ts; verification can be a simple call using token header
    await apiClient.get('/auth/me');
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Login failed. Please try again.');
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.authService.logout();
  } catch (error) {
    console.error('Logout error:', error);
    // Don't throw error on logout failure
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    await apiClient.get('/auth/me');
    return true;
  } catch (error) {
    return false;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data as User;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      return null;
    }
    console.error('Error getting current user:', error);
    return null;
  }
};
