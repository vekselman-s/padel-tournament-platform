import { apiClient } from './client';
import type { TeamRegistrationInput } from '@/lib/validations';

export interface Team {
  id: string;
  tournamentId: string;
  categoryId: string;
  name?: string;
  player1Id: string;
  player2Id: string;
  seed?: number;
  elo?: number;
  createdAt: string;
  updatedAt: string;
  player1?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  player2?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  category?: {
    id: string;
    name: string;
    gender: string;
    level: number;
  };
}

export interface Registration {
  id: string;
  tournamentId: string;
  teamId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'WAITLIST';
  paid: boolean;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  amountCents: number;
  currency: string;
  createdAt: string;
  team?: Team;
}

export const teamsApi = {
  register: async (data: TeamRegistrationInput): Promise<Registration> => {
    const response = await apiClient.post<Registration>('/teams/register', data);
    return response.data;
  },

  getMyTeams: async (): Promise<Team[]> => {
    const response = await apiClient.get<Team[]>('/teams/my-teams');
    return response.data;
  },

  getTeamsByTournament: async (tournamentId: string): Promise<Team[]> => {
    const response = await apiClient.get<Team[]>(`/tournaments/${tournamentId}/teams`);
    return response.data;
  },

  getTeamById: async (id: string): Promise<Team> => {
    const response = await apiClient.get<Team>(`/teams/${id}`);
    return response.data;
  },

  updateTeam: async (id: string, data: { name?: string }): Promise<Team> => {
    const response = await apiClient.patch<Team>(`/teams/${id}`, data);
    return response.data;
  },

  withdrawTeam: async (id: string): Promise<void> => {
    await apiClient.delete(`/teams/${id}`);
  },
};
