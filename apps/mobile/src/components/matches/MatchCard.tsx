import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Match } from '@/lib/api/matches';
import {
  formatDate,
  formatMatchScore,
  getMatchStatusText,
} from '@/lib/utils';

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const navigation = useNavigation();

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

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('MatchDetail' as never, { id: match.id } as never)
      }
    >
      <Card className="mb-3">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1">
              {match.tournamentName}
            </Text>
            <Text className="text-sm font-medium text-gray-700">
              Ronda {match.round}
            </Text>
          </View>
          <Badge variant={getStatusVariant(match.status)}>
            {getMatchStatusText(match.status)}
          </Badge>
        </View>

        <View className="space-y-2">
          {/* Team 1 */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {match.team1
                  ? `${match.team1.player1Name} / ${match.team1.player2Name}`
                  : 'TBD'}
              </Text>
            </View>
            {match.status === 'completed' && (
              <Text
                className={`text-xl font-bold ${
                  match.winnerId === match.team1?.id
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                {match.team1Score}
              </Text>
            )}
          </View>

          <View className="border-t border-gray-200 my-2" />

          {/* Team 2 */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {match.team2
                  ? `${match.team2.player1Name} / ${match.team2.player2Name}`
                  : 'TBD'}
              </Text>
            </View>
            {match.status === 'completed' && (
              <Text
                className={`text-xl font-bold ${
                  match.winnerId === match.team2?.id
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                {match.team2Score}
              </Text>
            )}
          </View>
        </View>

        {match.scheduledDate && (
          <View className="mt-3 pt-3 border-t border-gray-100">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">📅</Text>
              <Text className="text-sm text-gray-600">
                {formatDate(match.scheduledDate, "dd MMM yyyy 'a las' HH:mm")}
              </Text>
            </View>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}
