import { apiClient } from './client';
import type { MatchResultInput } from '@/lib/validations';

export interface Match {
  id: string;
  tournamentId: string;
  categoryId: string;
  round: number;
  matchNumber?: number;
  groupId?: string;
  courtId?: string;
  scheduledAt?: string;
  teamAId?: string;
  teamBId?: string;
  winnerId?: string;
  state: 'PENDING' | 'ONGOING' | 'DONE' | 'WALKOVER' | 'CANCELLED';
  bestOf: number;
  createdAt: string;
  updatedAt: string;
  teamA?: {
    id: string;
    name?: string;
    player1: { id: string; name: string };
    player2: { id: string; name: string };
  };
  teamB?: {
    id: string;
    name?: string;
    player1: { id: string; name: string };
    player2: { id: string; name: string };
  };
  court?: {
    id: string;
    name: string;
  };
  setScores?: SetScore[];
}

export interface SetScore {
  id: string;
  matchId: string;
  setNumber: number;
  gamesA: number;
  gamesB: number;
  tiebreakA?: number;
  tiebreakB?: number;
}

export interface Standing {
  id: string;
  groupId: string;
  teamId: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  diff: number;
  position?: number;
  team?: {
    id: string;
    name?: string;
    player1: { id: string; name: string };
    player2: { id: string; name: string };
  };
}

export const matchesApi = {
  getMatchesByTournament: async (tournamentId: string): Promise<Match[]> => {
    const response = await apiClient.get<Match[]>(`/tournaments/${tournamentId}/matches`);
    return response.data;
  },

  getMatchById: async (id: string): Promise<Match> => {
    const response = await apiClient.get<Match>(`/matches/${id}`);
    return response.data;
  },

  getMyMatches: async (): Promise<Match[]> => {
    const response = await apiClient.get<Match[]>('/matches/my-matches');
    return response.data;
  },

  reportResult: async (data: MatchResultInput): Promise<Match> => {
    const response = await apiClient.post<Match>('/matches/report-result', data);
    return response.data;
  },

  confirmResult: async (matchId: string): Promise<Match> => {
    const response = await apiClient.post<Match>(`/matches/${matchId}/confirm`);
    return response.data;
  },

  getBracket: async (tournamentId: string, categoryId: string): Promise<Match[]> => {
    const response = await apiClient.get<Match[]>(`/tournaments/${tournamentId}/bracket`, {
      params: { categoryId },
    });
    return response.data;
  },

  getStandings: async (tournamentId: string, categoryId: string): Promise<Standing[]> => {
    const response = await apiClient.get<Standing[]>(`/tournaments/${tournamentId}/standings`, {
      params: { categoryId },
    });
    return response.data;
  },

  scheduleMatch: async (matchId: string, data: { courtId: string; scheduledAt: string }): Promise<Match> => {
    const response = await apiClient.patch<Match>(`/matches/${matchId}/schedule`, data);
    return response.data;
  },
};
