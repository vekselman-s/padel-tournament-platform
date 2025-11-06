import { apiClient } from './client';

export interface Club {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string;
  website?: string;
  phone?: string;
  email?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  courts?: Court[];
  _count?: {
    tournaments: number;
    courts: number;
  };
}

export interface Court {
  id: string;
  clubId: string;
  name: string;
  surface?: 'GRASS' | 'HARD' | 'CLAY' | 'INDOOR' | 'OUTDOOR';
  indoor: boolean;
  hasLighting: boolean;
  availableFrom?: string;
  availableTo?: string;
}

export const clubsApi = {
  getAll: async (params?: { search?: string; city?: string; country?: string }): Promise<Club[]> => {
    const response = await apiClient.get<Club[]>('/clubs', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Club> => {
    const response = await apiClient.get<Club>(`/clubs/${id}`);
    return response.data;
  },

  getCourts: async (clubId: string): Promise<Court[]> => {
    const response = await apiClient.get<Court[]>(`/clubs/${clubId}/courts`);
    return response.data;
  },

  create: async (data: Partial<Club>): Promise<Club> => {
    const response = await apiClient.post<Club>('/clubs', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Club>): Promise<Club> => {
    const response = await apiClient.patch<Club>(`/clubs/${id}`, data);
    return response.data;
  },
};
