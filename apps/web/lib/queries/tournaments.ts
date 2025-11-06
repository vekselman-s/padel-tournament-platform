import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentsApi } from '@/lib/api/tournaments';
import { QUERY_KEYS } from '@/lib/constants';
import type { TournamentFilterInput, CreateTournamentInput } from '@/lib/validations';
import { toast } from 'sonner';

export function useTournaments(params?: TournamentFilterInput) {
  return useQuery({
    queryKey: [QUERY_KEYS.TOURNAMENTS, params],
    queryFn: () => tournamentsApi.getAll(params),
    staleTime: 30000, // 30 seconds
  });
}

export function useTournament(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.TOURNAMENT, id],
    queryFn: () => tournamentsApi.getById(id),
    enabled: !!id,
  });
}

export function useTournamentBySlug(slug: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.TOURNAMENT, 'slug', slug],
    queryFn: () => tournamentsApi.getByShareSlug(slug),
    enabled: !!slug,
  });
}

export function useFeaturedTournaments(limit: number = 6) {
  return useQuery({
    queryKey: [QUERY_KEYS.TOURNAMENTS, 'featured', limit],
    queryFn: () => tournamentsApi.getFeatured(limit),
    staleTime: 60000, // 1 minute
  });
}

export function useCreateTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTournamentInput) => tournamentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOURNAMENTS] });
      toast.success('Torneo creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear el torneo');
    },
  });
}

export function useUpdateTournament(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateTournamentInput>) => tournamentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOURNAMENT, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOURNAMENTS] });
      toast.success('Torneo actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el torneo');
    },
  });
}

export function usePublishTournament(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => tournamentsApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOURNAMENT, id] });
      toast.success('Torneo publicado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al publicar el torneo');
    },
  });
}

export function useCancelTournament(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => tournamentsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOURNAMENT, id] });
      toast.success('Torneo cancelado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al cancelar el torneo');
    },
  });
}

export function useDeleteTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tournamentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOURNAMENTS] });
      toast.success('Torneo eliminado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar el torneo');
    },
  });
}

export function useTournamentCategories(tournamentId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.TOURNAMENT, tournamentId, 'categories'],
    queryFn: () => tournamentsApi.getCategories(tournamentId),
    enabled: !!tournamentId,
  });
}
