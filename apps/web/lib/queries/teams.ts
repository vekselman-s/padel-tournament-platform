import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi } from '@/lib/api/teams';
import { QUERY_KEYS } from '@/lib/constants';
import type { TeamRegistrationInput } from '@/lib/validations';
import { toast } from 'sonner';

export function useMyTeams() {
  return useQuery({
    queryKey: [QUERY_KEYS.TEAMS, 'my-teams'],
    queryFn: () => teamsApi.getMyTeams(),
  });
}

export function useTournamentTeams(tournamentId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.TEAMS, 'tournament', tournamentId],
    queryFn: () => teamsApi.getTeamsByTournament(tournamentId),
    enabled: !!tournamentId,
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.TEAM, id],
    queryFn: () => teamsApi.getTeamById(id),
    enabled: !!id,
  });
}

export function useRegisterTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TeamRegistrationInput) => teamsApi.register(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAMS, 'my-teams'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REGISTRATIONS] });
      toast.success('Equipo registrado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al registrar el equipo');
    },
  });
}

export function useUpdateTeam(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string }) => teamsApi.updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAMS] });
      toast.success('Equipo actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el equipo');
    },
  });
}

export function useWithdrawTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamsApi.withdrawTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAMS] });
      toast.success('Equipo retirado del torneo');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al retirar el equipo');
    },
  });
}
