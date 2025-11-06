import { apiClient } from './client';
import type { ProfileUpdateInput } from '@/lib/validations';
import type { User } from './auth';

export const usersApi = {
  updateProfile: async (data: ProfileUpdateInput): Promise<User> => {
    const response = await apiClient.patch<User>('/users/profile', data);
    return response.data;
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/search', { params: { q: query } });
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },
};
