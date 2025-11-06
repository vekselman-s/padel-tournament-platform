import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { tournamentsApi, RegistrationRequest } from '../api/tournaments';

export function useTournaments(params?: {
  status?: string;
  search?: string;
}) {
  return useInfiniteQuery({
    queryKey: ['tournaments', params],
    queryFn: ({ pageParam = 1 }) =>
      tournamentsApi.getAll({ ...params, page: pageParam, limit: 10 }),
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total / 10);
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
  });
}

export function useTournament(id: string) {
  return useQuery({
    queryKey: ['tournament', id],
    queryFn: () => tournamentsApi.getById(id),
    enabled: !!id,
  });
}

export function useRegisterTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tournamentId,
      data,
    }: {
      tournamentId: string;
      data: RegistrationRequest;
    }) => tournamentsApi.register(tournamentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', variables.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['myTournaments'] });
    },
  });
}

export function useUnregisterTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tournamentId: string) =>
      tournamentsApi.unregister(tournamentId),
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['myTournaments'] });
    },
  });
}

export function useTournamentBracket(tournamentId: string) {
  return useQuery({
    queryKey: ['bracket', tournamentId],
    queryFn: () => tournamentsApi.getBracket(tournamentId),
    enabled: !!tournamentId,
  });
}

export function useTournamentStandings(tournamentId: string) {
  return useQuery({
    queryKey: ['standings', tournamentId],
    queryFn: () => tournamentsApi.getStandings(tournamentId),
    enabled: !!tournamentId,
  });
}

export function useMyTournaments() {
  return useQuery({
    queryKey: ['myTournaments'],
    queryFn: () => tournamentsApi.getMyTournaments(),
  });
}
