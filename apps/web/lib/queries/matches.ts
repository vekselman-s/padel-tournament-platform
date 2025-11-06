import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchesApi } from '@/lib/api/matches';
import { QUERY_KEYS } from '@/lib/constants';
import type { MatchResultInput } from '@/lib/validations';
import { toast } from 'sonner';

export function useMyMatches() {
  return useQuery({
    queryKey: [QUERY_KEYS.MATCHES, 'my-matches'],
    queryFn: () => matchesApi.getMyMatches(),
  });
}

export function useTournamentMatches(tournamentId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.MATCHES, 'tournament', tournamentId],
    queryFn: () => matchesApi.getMatchesByTournament(tournamentId),
    enabled: !!tournamentId,
  });
}

export function useMatch(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.MATCH, id],
    queryFn: () => matchesApi.getMatchById(id),
    enabled: !!id,
  });
}

export function useBracket(tournamentId: string, categoryId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.BRACKET, tournamentId, categoryId],
    queryFn: () => matchesApi.getBracket(tournamentId, categoryId),
    enabled: !!tournamentId && !!categoryId,
  });
}

export function useStandings(tournamentId: string, categoryId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.STANDINGS, tournamentId, categoryId],
    queryFn: () => matchesApi.getStandings(tournamentId, categoryId),
    enabled: !!tournamentId && !!categoryId,
  });
}

export function useReportResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MatchResultInput) => matchesApi.reportResult(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCH, variables.matchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCHES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BRACKET] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STANDINGS] });
      toast.success('Resultado reportado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al reportar el resultado');
    },
  });
}

export function useConfirmResult(matchId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => matchesApi.confirmResult(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCH, matchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCHES] });
      toast.success('Resultado confirmado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al confirmar el resultado');
    },
  });
}

export function useScheduleMatch(matchId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { courtId: string; scheduledAt: string }) =>
      matchesApi.scheduleMatch(matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCH, matchId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCHES] });
      toast.success('Partido programado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al programar el partido');
    },
  });
}
