import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Tournament } from '@/lib/api/tournaments';
import {
  formatDate,
  getTournamentStatusText,
  getTournamentStatusColor,
} from '@/lib/utils';

interface TournamentCardProps {
  tournament: Tournament;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const navigation = useNavigation();

  const getStatusVariant = (status: string) => {
    const variantMap: Record<
      string,
      'default' | 'success' | 'warning' | 'danger' | 'info'
    > = {
      draft: 'default',
      registration_open: 'success',
      registration_closed: 'warning',
      in_progress: 'info',
      completed: 'default',
      cancelled: 'danger',
    };
    return variantMap[status] || 'default';
  };

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('TournamentDetail' as never, { id: tournament.id } as never)
      }
    >
      <Card className="mb-3">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-semibold text-gray-900 flex-1">
            {tournament.name}
          </Text>
          <Badge variant={getStatusVariant(tournament.status)}>
            {getTournamentStatusText(tournament.status)}
          </Badge>
        </View>

        <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
          {tournament.description}
        </Text>

        <View className="space-y-2">
          <View className="flex-row items-center">
            <Text className="text-2xl mr-2">📍</Text>
            <Text className="text-sm text-gray-700">{tournament.location}</Text>
          </View>

          <View className="flex-row items-center">
            <Text className="text-2xl mr-2">📅</Text>
            <Text className="text-sm text-gray-700">
              {formatDate(tournament.startDate, 'dd MMM yyyy')}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">👥</Text>
              <Text className="text-sm text-gray-700">
                {tournament.currentTeams}/{tournament.maxTeams} equipos
              </Text>
            </View>

            {tournament.status === 'registration_open' && (
              <Badge variant="success">Inscripción abierta</Badge>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
