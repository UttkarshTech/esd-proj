import { get, post } from './client';
import { type User, type AuthStatus } from '../types';

export const authAPI = {
  async getCurrentUser(): Promise<User> {
    return get<User>('/api/auth/user');
  },

  async getStatus(): Promise<AuthStatus> {
    return get<AuthStatus>('/api/auth/status');
  },

  async logout(): Promise<{ message: string; user: string }> {
    return post('/api/auth/logout');
  },
};
