import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { MatchCard } from '@/components/matches/MatchCard';
import { TournamentCard } from '@/components/tournaments/TournamentCard';
import { useUpcomingMatches } from '@/lib/queries/matches';
import { useTournaments } from '@/lib/queries/tournaments';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';

export default function HomeScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const isRefreshing = useUIStore((state) => state.isRefreshing);
  const setRefreshing = useUIStore((state) => state.setRefreshing);

  const {
    data: upcomingMatches,
    isLoading: matchesLoading,
    refetch: refetchMatches,
  } = useUpcomingMatches(3);

  const {
    data: tournamentsData,
    isLoading: tournamentsLoading,
    refetch: refetchTournaments,
  } = useTournaments({ status: 'registration_open' });

  const featuredTournaments =
    tournamentsData?.pages[0]?.tournaments.slice(0, 3) || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchMatches(), refetchTournaments()]);
    setRefreshing(false);
  };

  if (matchesLoading || tournamentsLoading) {
    return <LoadingSpinner message="Cargando..." />;
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-primary-500 p-6 pb-8">
        <Text className="text-3xl font-bold text-white mb-2">
          Hola, {user?.name?.split(' ')[0]} 👋
        </Text>
        <Text className="text-white/90">
          Bienvenido a tu plataforma de torneos de padel
        </Text>
      </View>

      <View className="p-4">
        {/* Upcoming Matches */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-gray-900">
              Próximos Partidos
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onPress={() =>
                navigation.navigate('MatchesTab' as never, { screen: 'Matches' } as never)
              }
            >
              Ver todos
            </Button>
          </View>

          {upcomingMatches && upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <EmptyState
              icon="🎾"
              title="No hay partidos próximos"
              description="Inscríbete en un torneo para empezar a jugar"
            />
          )}
        </View>

        {/* Featured Tournaments */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-gray-900">
              Torneos Destacados
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onPress={() =>
                navigation.navigate('TournamentsTab' as never, { screen: 'Tournaments' } as never)
              }
            >
              Ver todos
            </Button>
          </View>

          {featuredTournaments.length > 0 ? (
            featuredTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))
          ) : (
            <EmptyState
              icon="🏆"
              title="No hay torneos disponibles"
              description="Los torneos aparecerán aquí cuando estén disponibles"
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}
