import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { useTournamentStandings } from '@/lib/queries/tournaments';
import { useUIStore } from '@/lib/store/ui-store';

export default function StandingsScreen() {
  const route = useRoute();
  const { tournamentId } = route.params as { tournamentId: string };

  const { data: standings, isLoading, refetch } = useTournamentStandings(tournamentId);
  const { isRefreshing, setRefreshing } = useUIStore();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando clasificación..." />;
  }

  if (!standings || standings.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="La clasificación no está disponible aún"
        description="La clasificación se mostrará cuando comiencen los partidos"
      />
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View className="p-4">
        <Card>
          {/* Header */}
          <View className="flex-row pb-3 border-b border-gray-200 mb-3">
            <Text className="w-12 text-sm font-semibold text-gray-600">Pos</Text>
            <Text className="flex-1 text-sm font-semibold text-gray-600">Equipo</Text>
            <Text className="w-12 text-sm font-semibold text-gray-600 text-center">
              PJ
            </Text>
            <Text className="w-12 text-sm font-semibold text-gray-600 text-center">
              G
            </Text>
            <Text className="w-12 text-sm font-semibold text-gray-600 text-center">
              P
            </Text>
            <Text className="w-12 text-sm font-semibold text-gray-600 text-center">
              Pts
            </Text>
          </View>

          {/* Standings */}
          {standings.map((standing: any, index: number) => (
            <View
              key={standing.teamId}
              className={`flex-row py-3 ${
                index !== standings.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <Text className="w-12 text-base font-semibold text-gray-900">
                {index + 1}
              </Text>
              <View className="flex-1">
                <Text className="text-base text-gray-900" numberOfLines={1}>
                  {standing.teamName}
                </Text>
              </View>
              <Text className="w-12 text-base text-gray-600 text-center">
                {standing.played}
              </Text>
              <Text className="w-12 text-base text-green-600 text-center">
                {standing.won}
              </Text>
              <Text className="w-12 text-base text-red-600 text-center">
                {standing.lost}
              </Text>
              <Text className="w-12 text-base font-semibold text-gray-900 text-center">
                {standing.points}
              </Text>
            </View>
          ))}
        </Card>

        {/* Legend */}
        <View className="mt-4 bg-white rounded-xl p-4">
          <Text className="text-sm font-semibold text-gray-900 mb-2">Leyenda</Text>
          <Text className="text-xs text-gray-600">PJ: Partidos Jugados</Text>
          <Text className="text-xs text-gray-600">G: Ganados</Text>
          <Text className="text-xs text-gray-600">P: Perdidos</Text>
          <Text className="text-xs text-gray-600">Pts: Puntos</Text>
        </View>
      </View>
    </ScrollView>
  );
}
