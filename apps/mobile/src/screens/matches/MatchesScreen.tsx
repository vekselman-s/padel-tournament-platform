import React, { useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { MatchCard } from '@/components/matches/MatchCard';
import { useMyMatches } from '@/lib/queries/matches';
import { useUIStore } from '@/lib/store/ui-store';

type TabType = 'upcoming' | 'completed' | 'all';

export default function MatchesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const { isRefreshing, setRefreshing } = useUIStore();

  const params =
    activeTab === 'upcoming'
      ? { upcoming: true }
      : activeTab === 'completed'
      ? { status: 'completed' }
      : {};

  const { data: matches, isLoading, refetch } = useMyMatches(params);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando partidos..." />;
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'upcoming', label: 'Próximos' },
    { key: 'completed', label: 'Completados' },
    { key: 'all', label: 'Todos' },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Tabs */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row px-4">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 py-4 border-b-2 ${
                activeTab === tab.key
                  ? 'border-primary-500'
                  : 'border-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === tab.key
                    ? 'text-primary-500'
                    : 'text-gray-500'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Matches List */}
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <MatchCard match={item} />
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={() => (
          <EmptyState
            icon="🎾"
            title="No hay partidos"
            description={
              activeTab === 'upcoming'
                ? 'No tienes partidos próximos'
                : activeTab === 'completed'
                ? 'No has completado ningún partido'
                : 'No tienes partidos registrados'
            }
          />
        )}
      />
    </View>
  );
}
