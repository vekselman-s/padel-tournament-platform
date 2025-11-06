import { apiClient } from './client';
import type { TournamentFilterInput, CreateTournamentInput } from '@/lib/validations';

export interface Tournament {
  id: string;
  clubId: string;
  organizerId: string;
  name: string;
  description?: string;
  startAt: string;
  endAt: string;
  location: string;
  coverUrl?: string;
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
  status: 'DRAFT' | 'REGISTRATION' | 'LIVE' | 'FINISHED' | 'CANCELLED';
  format: 'SINGLE_ELIM' | 'DOUBLE_ELIM' | 'ROUND_ROBIN' | 'AMERICANO' | 'MEXICANO' | 'GROUPS_PLAYOFFS';
  maxTeams?: number;
  minTeams?: number;
  entryFeeCents: number;
  currency: string;
  shareSlug: string;
  languages: string[];
  createdAt: string;
  updatedAt: string;
  club?: {
    id: string;
    name: string;
    city: string;
    logoUrl?: string;
  };
  organizer?: {
    id: string;
    name: string;
    email: string;
  };
  categories?: Category[];
  _count?: {
    teams: number;
    registrations: number;
  };
}

export interface Category {
  id: string;
  tournamentId: string;
  name: string;
  gender: 'M' | 'F' | 'X';
  level: number;
  ballType?: string;
  courtType?: string;
  maxTeams?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const tournamentsApi = {
  getAll: async (params?: TournamentFilterInput): Promise<PaginatedResponse<Tournament>> => {
    const response = await apiClient.get<PaginatedResponse<Tournament>>('/tournaments', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Tournament> => {
    const response = await apiClient.get<Tournament>(`/tournaments/${id}`);
    return response.data;
  },

  getByShareSlug: async (slug: string): Promise<Tournament> => {
    const response = await apiClient.get<Tournament>(`/tournaments/share/${slug}`);
    return response.data;
  },

  create: async (data: CreateTournamentInput): Promise<Tournament> => {
    const response = await apiClient.post<Tournament>('/tournaments', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateTournamentInput>): Promise<Tournament> => {
    const response = await apiClient.patch<Tournament>(`/tournaments/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tournaments/${id}`);
  },

  publish: async (id: string): Promise<Tournament> => {
    const response = await apiClient.post<Tournament>(`/tournaments/${id}/publish`);
    return response.data;
  },

  cancel: async (id: string): Promise<Tournament> => {
    const response = await apiClient.post<Tournament>(`/tournaments/${id}/cancel`);
    return response.data;
  },

  getCategories: async (tournamentId: string): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>(`/tournaments/${tournamentId}/categories`);
    return response.data;
  },

  getFeatured: async (limit: number = 6): Promise<Tournament[]> => {
    const response = await apiClient.get<Tournament[]>('/tournaments/featured', { params: { limit } });
    return response.data;
  },
};
