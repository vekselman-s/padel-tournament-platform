import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ScoreDisplay } from '@/components/matches/ScoreDisplay';
import { useMatch } from '@/lib/queries/matches';
import { formatDate, getMatchStatusText } from '@/lib/utils';
import { useUIStore } from '@/lib/store/ui-store';

export default function MatchDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const { data: match, isLoading, refetch } = useMatch(id);
  const { isRefreshing, setRefreshing } = useUIStore();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading || !match) {
    return <LoadingSpinner message="Cargando partido..." />;
  }

  const getStatusVariant = (status: string) => {
    const variantMap: Record<
      string,
      'default' | 'success' | 'warning' | 'danger' | 'info'
    > = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'danger',
    };
    return variantMap[status] || 'default';
  };

  const canReportResult =
    match.status === 'pending' || match.status === 'in_progress';

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View className="p-4">
        {/* Header */}
        <Card className="mb-4">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                {match.tournament.name}
              </Text>
              <Text className="text-sm text-gray-600">Ronda {match.round}</Text>
            </View>
            <Badge variant={getStatusVariant(match.status)}>
              {getMatchStatusText(match.status)}
            </Badge>
          </View>

          {match.scheduledDate && (
            <View className="flex-row items-center mt-2">
              <Text className="text-2xl mr-2">📅</Text>
              <Text className="text-base text-gray-700">
                {formatDate(match.scheduledDate, "dd MMM yyyy 'a las' HH:mm")}
              </Text>
            </View>
          )}
        </Card>

        {/* Score */}
        <View className="mb-4">
          <ScoreDisplay
            team1Name={
              match.team1
                ? `${match.team1.player1Name} / ${match.team1.player2Name}`
                : 'TBD'
            }
            team2Name={
              match.team2
                ? `${match.team2.player1Name} / ${match.team2.player2Name}`
                : 'TBD'
            }
            team1Score={match.team1Score}
            team2Score={match.team2Score}
            winnerId={match.winnerId}
            team1Id={match.team1?.id}
            team2Id={match.team2?.id}
          />
        </View>

        {/* Result Photo */}
        {match.resultPhoto && (
          <Card className="mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Foto del Resultado
            </Text>
            <Image
              source={{ uri: match.resultPhoto }}
              style={{ width: '100%', height: 300, borderRadius: 12 }}
              contentFit="cover"
            />
            {match.resultReportedBy && match.resultReportedAt && (
              <View className="mt-3 pt-3 border-t border-gray-100">
                <Text className="text-sm text-gray-600">
                  Reportado por {match.resultReportedBy}
                </Text>
                <Text className="text-xs text-gray-500">
                  {formatDate(match.resultReportedAt, "dd MMM yyyy 'a las' HH:mm")}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Action Button */}
        {canReportResult && (
          <Button
            onPress={() =>
              navigation.navigate('ReportResult' as never, { matchId: match.id } as never)
            }
          >
            Reportar Resultado
          </Button>
        )}
      </View>
    </ScrollView>
  );
}
