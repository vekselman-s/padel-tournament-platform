import { apiClient } from './client';

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  round: number;
  scheduledDate: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  team1: {
    id: string;
    player1Name: string;
    player2Name: string;
  } | null;
  team2: {
    id: string;
    player1Name: string;
    player2Name: string;
  } | null;
  team1Score: number | null;
  team2Score: number | null;
  winnerId: string | null;
  createdAt: string;
}

export interface MatchDetail extends Match {
  tournament: {
    id: string;
    name: string;
    format: string;
  };
  resultPhoto?: string;
  resultReportedBy?: string;
  resultReportedAt?: string;
}

export interface ReportResultRequest {
  team1Score: number;
  team2Score: number;
  photo?: string; // Base64 encoded image
}

export const matchesApi = {
  getMyMatches: async (params?: {
    status?: string;
    upcoming?: boolean;
  }): Promise<Match[]> => {
    const response = await apiClient.get('/matches/my', { params });
    return response.data;
  },

  getById: async (id: string): Promise<MatchDetail> => {
    const response = await apiClient.get(`/matches/${id}`);
    return response.data;
  },

  reportResult: async (
    matchId: string,
    data: ReportResultRequest
  ): Promise<void> => {
    await apiClient.post(`/matches/${matchId}/result`, data);
  },

  uploadPhoto: async (matchId: string, photo: FormData): Promise<string> => {
    const response = await apiClient.post(
      `/matches/${matchId}/photo`,
      photo,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.url;
  },

  getUpcoming: async (limit: number = 5): Promise<Match[]> => {
    const response = await apiClient.get('/matches/upcoming', {
      params: { limit },
    });
    return response.data;
  },

  getRecent: async (limit: number = 5): Promise<Match[]> => {
    const response = await apiClient.get('/matches/recent', {
      params: { limit },
    });
    return response.data;
  },
};
