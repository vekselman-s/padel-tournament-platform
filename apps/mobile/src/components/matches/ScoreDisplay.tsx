import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface ScoreDisplayProps {
  team1Name: string;
  team2Name: string;
  team1Score: number | null;
  team2Score: number | null;
  winnerId?: string | null;
  team1Id?: string;
  team2Id?: string;
}

export function ScoreDisplay({
  team1Name,
  team2Name,
  team1Score,
  team2Score,
  winnerId,
  team1Id,
  team2Id,
}: ScoreDisplayProps) {
  const isTeam1Winner = winnerId === team1Id;
  const isTeam2Winner = winnerId === team2Id;

  return (
    <View className="bg-white rounded-xl p-4 shadow-sm">
      {/* Team 1 */}
      <View
        className={cn(
          'flex-row items-center justify-between p-3 rounded-lg',
          isTeam1Winner && 'bg-green-50'
        )}
      >
        <View className="flex-1">
          <Text
            className={cn(
              'text-lg font-semibold',
              isTeam1Winner ? 'text-green-700' : 'text-gray-900'
            )}
          >
            {team1Name}
          </Text>
          {isTeam1Winner && (
            <Text className="text-xs text-green-600 mt-1">🏆 Ganador</Text>
          )}
        </View>
        {team1Score !== null && (
          <Text
            className={cn(
              'text-3xl font-bold',
              isTeam1Winner ? 'text-green-600' : 'text-gray-600'
            )}
          >
            {team1Score}
          </Text>
        )}
      </View>

      <View className="h-px bg-gray-200 my-2" />

      {/* Team 2 */}
      <View
        className={cn(
          'flex-row items-center justify-between p-3 rounded-lg',
          isTeam2Winner && 'bg-green-50'
        )}
      >
        <View className="flex-1">
          <Text
            className={cn(
              'text-lg font-semibold',
              isTeam2Winner ? 'text-green-700' : 'text-gray-900'
            )}
          >
            {team2Name}
          </Text>
          {isTeam2Winner && (
            <Text className="text-xs text-green-600 mt-1">🏆 Ganador</Text>
          )}
        </View>
        {team2Score !== null && (
          <Text
            className={cn(
              'text-3xl font-bold',
              isTeam2Winner ? 'text-green-600' : 'text-gray-600'
            )}
          >
            {team2Score}
          </Text>
        )}
      </View>
    </View>
  );
}
