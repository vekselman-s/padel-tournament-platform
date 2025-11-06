import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { TournamentCard } from '@/components/tournaments/TournamentCard';
import { useTournaments } from '@/lib/queries/tournaments';
import { useUIStore } from '@/lib/store/ui-store';

export default function TournamentsScreen() {
  const [search, setSearch] = useState('');
  const isRefreshing = useUIStore((state) => state.isRefreshing);
  const setRefreshing = useUIStore((state) => state.setRefreshing);

  const {
    data,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTournaments({ search });

  const tournaments = data?.pages.flatMap((page) => page.tournaments) || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando torneos..." />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-4 border-b border-gray-200">
        <Input
          placeholder="Buscar torneos..."
          value={search}
          onChangeText={setSearch}
          containerClassName="mb-0"
        />
      </View>

      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <TournamentCard tournament={item} />
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#0ea5e9" />
            </View>
          ) : null
        }
        ListEmptyComponent={() => (
          <EmptyState
            icon="🏆"
            title="No se encontraron torneos"
            description={
              search
                ? 'Intenta con otra búsqueda'
                : 'No hay torneos disponibles en este momento'
            }
          />
        )}
      />
    </View>
  );
}
