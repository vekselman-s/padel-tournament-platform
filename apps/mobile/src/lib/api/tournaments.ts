import { apiClient } from './client';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  format: 'single_elimination' | 'round_robin' | 'double_elimination';
  status: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: number;
  currentTeams: number;
  location: string;
  createdAt: string;
}

export interface TournamentDetail extends Tournament {
  teams: any[];
  matches: any[];
  standings?: any[];
}

export interface RegistrationRequest {
  player1Name: string;
  player2Name: string;
}

export const tournamentsApi = {
  getAll: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ tournaments: Tournament[]; total: number }> => {
    const response = await apiClient.get('/tournaments', { params });
    return response.data;
  },

  getById: async (id: string): Promise<TournamentDetail> => {
    const response = await apiClient.get(`/tournaments/${id}`);
    return response.data;
  },

  register: async (
    tournamentId: string,
    data: RegistrationRequest
  ): Promise<void> => {
    await apiClient.post(`/tournaments/${tournamentId}/register`, data);
  },

  unregister: async (tournamentId: string): Promise<void> => {
    await apiClient.delete(`/tournaments/${tournamentId}/register`);
  },

  getBracket: async (tournamentId: string): Promise<any> => {
    const response = await apiClient.get(`/tournaments/${tournamentId}/bracket`);
    return response.data;
  },

  getStandings: async (tournamentId: string): Promise<any[]> => {
    const response = await apiClient.get(`/tournaments/${tournamentId}/standings`);
    return response.data;
  },

  getMyTournaments: async (): Promise<Tournament[]> => {
    const response = await apiClient.get('/tournaments/my');
    return response.data;
  },
};
