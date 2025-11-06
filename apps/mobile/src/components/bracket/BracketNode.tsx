import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { cn } from '@/lib/utils';

interface BracketNodeProps {
  match: {
    id: string;
    round: number;
    team1?: {
      id: string;
      player1Name: string;
      player2Name: string;
    } | null;
    team2?: {
      id: string;
      player1Name: string;
      player2Name: string;
    } | null;
    team1Score: number | null;
    team2Score: number | null;
    winnerId: string | null;
    status: string;
  };
}

export function BracketNode({ match }: BracketNodeProps) {
  const navigation = useNavigation();

  const isTeam1Winner = match.winnerId === match.team1?.id;
  const isTeam2Winner = match.winnerId === match.team2?.id;

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('MatchDetail' as never, { id: match.id } as never)
      }
      className="bg-white rounded-lg border border-gray-200 p-2 mb-2 w-56"
    >
      <Text className="text-xs text-gray-500 mb-2">Ronda {match.round}</Text>

      {/* Team 1 */}
      <View
        className={cn(
          'flex-row items-center justify-between py-2 px-2 rounded',
          isTeam1Winner && 'bg-green-50'
        )}
      >
        <Text
          className={cn(
            'text-sm flex-1',
            isTeam1Winner ? 'font-semibold text-green-700' : 'text-gray-700'
          )}
          numberOfLines={1}
        >
          {match.team1
            ? `${match.team1.player1Name} / ${match.team1.player2Name}`
            : 'TBD'}
        </Text>
        {match.team1Score !== null && (
          <Text
            className={cn(
              'text-base font-bold ml-2',
              isTeam1Winner ? 'text-green-600' : 'text-gray-400'
            )}
          >
            {match.team1Score}
          </Text>
        )}
      </View>

      <View className="h-px bg-gray-200 my-1" />

      {/* Team 2 */}
      <View
        className={cn(
          'flex-row items-center justify-between py-2 px-2 rounded',
          isTeam2Winner && 'bg-green-50'
        )}
      >
        <Text
          className={cn(
            'text-sm flex-1',
            isTeam2Winner ? 'font-semibold text-green-700' : 'text-gray-700'
          )}
          numberOfLines={1}
        >
          {match.team2
            ? `${match.team2.player1Name} / ${match.team2.player2Name}`
            : 'TBD'}
        </Text>
        {match.team2Score !== null && (
          <Text
            className={cn(
              'text-base font-bold ml-2',
              isTeam2Winner ? 'text-green-600' : 'text-gray-400'
            )}
          >
            {match.team2Score}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
