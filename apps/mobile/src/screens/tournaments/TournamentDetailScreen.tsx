import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  useTournament,
  useRegisterTournament,
  useUnregisterTournament,
} from '@/lib/queries/tournaments';
import {
  formatDate,
  getTournamentStatusText,
  getTournamentStatusColor,
} from '@/lib/utils';
import { useUIStore } from '@/lib/store/ui-store';

export default function TournamentDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');

  const { data: tournament, isLoading, refetch } = useTournament(id);
  const registerMutation = useRegisterTournament();
  const unregisterMutation = useUnregisterTournament();
  const { isRefreshing, setRefreshing, showToast } = useUIStore();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRegister = async () => {
    if (!player1Name || !player2Name) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        tournamentId: id,
        data: { player1Name, player2Name },
      });
      showToast('Inscripción exitosa', 'success');
      setShowRegisterModal(false);
      setPlayer1Name('');
      setPlayer2Name('');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al inscribirse', 'error');
    }
  };

  const handleUnregister = async () => {
    try {
      await unregisterMutation.mutateAsync(id);
      showToast('Te has dado de baja del torneo', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error al darse de baja', 'error');
    }
  };

  if (isLoading || !tournament) {
    return <LoadingSpinner message="Cargando torneo..." />;
  }

  const canRegister = tournament.status === 'registration_open';

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View className="p-4">
        {/* Header Card */}
        <Card className="mb-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {tournament.name}
          </Text>
          <Badge
            variant={
              tournament.status === 'registration_open' ? 'success' : 'default'
            }
            className="mb-3"
          >
            {getTournamentStatusText(tournament.status)}
          </Badge>

          <Text className="text-base text-gray-700 mb-4">
            {tournament.description}
          </Text>

          <View className="space-y-3">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">📍</Text>
              <Text className="text-base text-gray-700">{tournament.location}</Text>
            </View>

            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">📅</Text>
              <Text className="text-base text-gray-700">
                {formatDate(tournament.startDate, 'dd MMM yyyy')} -{' '}
                {formatDate(tournament.endDate, 'dd MMM yyyy')}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">⏰</Text>
              <Text className="text-base text-gray-700">
                Inscripción hasta: {formatDate(tournament.registrationDeadline, 'dd MMM yyyy')}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">👥</Text>
              <Text className="text-base text-gray-700">
                {tournament.currentTeams}/{tournament.maxTeams} equipos
              </Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        {canRegister && (
          <Button onPress={() => setShowRegisterModal(true)} className="mb-3">
            Inscribirse
          </Button>
        )}

        <View className="flex-row space-x-2 mb-4">
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => navigation.navigate('Bracket' as never, { tournamentId: id } as never)}
          >
            Ver Cuadro
          </Button>
          {tournament.format === 'round_robin' && (
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => navigation.navigate('Standings' as never, { tournamentId: id } as never)}
            >
              Clasificación
            </Button>
          )}
        </View>

        {/* Teams List */}
        {tournament.teams && tournament.teams.length > 0 && (
          <Card>
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Equipos Inscritos ({tournament.teams.length})
            </Text>
            {tournament.teams.map((team: any, index: number) => (
              <View
                key={team.id}
                className={`py-3 ${index !== tournament.teams.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <Text className="text-base text-gray-900">
                  {team.player1Name} / {team.player2Name}
                </Text>
              </View>
            ))}
          </Card>
        )}
      </View>

      {/* Registration Modal */}
      <Modal
        visible={showRegisterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRegisterModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-2xl font-bold text-gray-900 mb-4">
              Inscribirse al Torneo
            </Text>

            <Input
              label="Jugador 1"
              placeholder="Nombre del jugador 1"
              value={player1Name}
              onChangeText={setPlayer1Name}
            />

            <Input
              label="Jugador 2"
              placeholder="Nombre del jugador 2"
              value={player2Name}
              onChangeText={setPlayer2Name}
            />

            <View className="flex-row space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => setShowRegisterModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onPress={handleRegister}
                loading={registerMutation.isPending}
              >
                Confirmar
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
