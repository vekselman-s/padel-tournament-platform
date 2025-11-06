import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchesApi, ReportResultRequest } from '../api/matches';
import { storage } from '../storage';

export function useMyMatches(params?: { status?: string; upcoming?: boolean }) {
  return useQuery({
    queryKey: ['myMatches', params],
    queryFn: () => matchesApi.getMyMatches(params),
  });
}

export function useMatch(id: string) {
  return useQuery({
    queryKey: ['match', id],
    queryFn: () => matchesApi.getById(id),
    enabled: !!id,
  });
}

export function useReportResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      data,
    }: {
      matchId: string;
      data: ReportResultRequest;
    }) => {
      try {
        await matchesApi.reportResult(matchId, data);
      } catch (error) {
        // If offline, save to pending results
        await storage.addPendingResult({ matchId, data });
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['match', variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ['myMatches'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingMatches'] });
      queryClient.invalidateQueries({ queryKey: ['recentMatches'] });
    },
  });
}

export function useUpcomingMatches(limit: number = 5) {
  return useQuery({
    queryKey: ['upcomingMatches', limit],
    queryFn: () => matchesApi.getUpcoming(limit),
  });
}

export function useRecentMatches(limit: number = 5) {
  return useQuery({
    queryKey: ['recentMatches', limit],
    queryFn: () => matchesApi.getRecent(limit),
  });
}

// Sync pending results when online
export function useSyncPendingResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const pending = await storage.getPendingResults();
      const results = [];

      for (let i = 0; i < pending.length; i++) {
        const { matchId, data } = pending[i];
        try {
          await matchesApi.reportResult(matchId, data);
          await storage.removePendingResult(i);
          results.push({ success: true, matchId });
        } catch (error) {
          results.push({ success: false, matchId, error });
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMatches'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingMatches'] });
      queryClient.invalidateQueries({ queryKey: ['recentMatches'] });
    },
  });
}
