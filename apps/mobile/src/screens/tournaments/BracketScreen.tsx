import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { BracketNode } from '@/components/bracket/BracketNode';
import { useTournamentBracket } from '@/lib/queries/tournaments';
import { useUIStore } from '@/lib/store/ui-store';

export default function BracketScreen() {
  const route = useRoute();
  const { tournamentId } = route.params as { tournamentId: string };

  const { data: bracket, isLoading, refetch } = useTournamentBracket(tournamentId);
  const { isRefreshing, setRefreshing } = useUIStore();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando cuadro..." />;
  }

  if (!bracket || bracket.length === 0) {
    return (
      <EmptyState
        icon="🎾"
        title="El cuadro no está disponible aún"
        description="El cuadro se generará cuando comience el torneo"
      />
    );
  }

  // Group matches by round
  const matchesByRound = bracket.reduce((acc: any, match: any) => {
    const round = match.round;
    if (!acc[round]) {
      acc[round] = [];
    }
    acc[round].push(match);
    return acc;
  }, {});

  const rounds = Object.keys(matchesByRound).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <ScrollView
      horizontal
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View className="flex-row p-4">
        {rounds.map((round) => (
          <View key={round} className="mr-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Ronda {round}
            </Text>
            <View className="space-y-4">
              {matchesByRound[round].map((match: any) => (
                <BracketNode key={match.id} match={match} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
