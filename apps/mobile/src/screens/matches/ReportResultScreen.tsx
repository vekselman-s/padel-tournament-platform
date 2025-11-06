import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image as RNImage,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useMatch, useReportResult } from '@/lib/queries/matches';
import { useUIStore } from '@/lib/store/ui-store';

export default function ReportResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { matchId } = route.params as { matchId: string };

  const [team1Score, setTeam1Score] = useState('');
  const [team2Score, setTeam2Score] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ team1Score?: string; team2Score?: string }>({});

  const { data: match, isLoading } = useMatch(matchId);
  const reportMutation = useReportResult();
  const showToast = useUIStore((state) => state.showToast);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Se necesita acceso a la cámara para tomar fotos del resultado.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Se necesita acceso a la galería para seleccionar fotos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const validate = () => {
    const newErrors: { team1Score?: string; team2Score?: string } = {};

    if (!team1Score) {
      newErrors.team1Score = 'Requerido';
    } else if (isNaN(Number(team1Score)) || Number(team1Score) < 0) {
      newErrors.team1Score = 'Debe ser un número válido';
    }

    if (!team2Score) {
      newErrors.team2Score = 'Requerido';
    } else if (isNaN(Number(team2Score)) || Number(team2Score) < 0) {
      newErrors.team2Score = 'Debe ser un número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await reportMutation.mutateAsync({
        matchId,
        data: {
          team1Score: Number(team1Score),
          team2Score: Number(team2Score),
          photo: photo || undefined,
        },
      });
      showToast('Resultado reportado exitosamente', 'success');
      navigation.goBack();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Error al reportar resultado',
        'error'
      );
    }
  };

  if (isLoading || !match) {
    return <LoadingSpinner message="Cargando partido..." />;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Match Info */}
        <Card className="mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            {match.tournament.name}
          </Text>
          <Text className="text-sm text-gray-600">Ronda {match.round}</Text>
        </Card>

        {/* Score Input */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Ingresar Resultado
          </Text>

          {/* Team 1 */}
          <View className="mb-4">
            <Text className="text-base font-medium text-gray-900 mb-2">
              {match.team1
                ? `${match.team1.player1Name} / ${match.team1.player2Name}`
                : 'TBD'}
            </Text>
            <Input
              placeholder="Sets ganados"
              value={team1Score}
              onChangeText={setTeam1Score}
              keyboardType="numeric"
              error={errors.team1Score}
              containerClassName="mb-0"
            />
          </View>

          {/* Team 2 */}
          <View>
            <Text className="text-base font-medium text-gray-900 mb-2">
              {match.team2
                ? `${match.team2.player1Name} / ${match.team2.player2Name}`
                : 'TBD'}
            </Text>
            <Input
              placeholder="Sets ganados"
              value={team2Score}
              onChangeText={setTeam2Score}
              keyboardType="numeric"
              error={errors.team2Score}
              containerClassName="mb-0"
            />
          </View>
        </Card>

        {/* Photo Upload */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Foto del Resultado (Opcional)
          </Text>

          {photo ? (
            <View>
              <RNImage
                source={{ uri: photo }}
                style={{ width: '100%', height: 300, borderRadius: 12 }}
                resizeMode="cover"
              />
              <Button
                variant="outline"
                size="sm"
                onPress={() => setPhoto(null)}
                className="mt-3"
              >
                Quitar foto
              </Button>
            </View>
          ) : (
            <View className="flex-row space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onPress={pickImage}
              >
                📷 Tomar Foto
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onPress={pickFromGallery}
              >
                🖼️ Galería
              </Button>
            </View>
          )}
        </Card>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit}
          loading={reportMutation.isPending}
        >
          Reportar Resultado
        </Button>
      </View>
    </ScrollView>
  );
}
