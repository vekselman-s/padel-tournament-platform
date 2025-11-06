import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useChangePassword } from '@/lib/queries/auth';
import { useUIStore } from '@/lib/store/ui-store';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [matchReminders, setMatchReminders] = useState(true);
  const [tournamentUpdates, setTournamentUpdates] = useState(true);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const changePasswordMutation = useChangePassword();
  const showToast = useUIStore((state) => state.showToast);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      showToast('Contraseña actualizada exitosamente', 'success');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Error al cambiar contraseña',
        'error'
      );
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpiar Caché',
      '¿Estás seguro que deseas limpiar el caché de la aplicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => {
            showToast('Caché limpiado', 'success');
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Notifications */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Notificaciones
          </Text>

          <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <Text className="text-base text-gray-900">Activar notificaciones</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#d1d5db', true: '#0ea5e9' }}
            />
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <Text className="text-base text-gray-900">
              Recordatorios de partidos
            </Text>
            <Switch
              value={matchReminders}
              onValueChange={setMatchReminders}
              trackColor={{ false: '#d1d5db', true: '#0ea5e9' }}
              disabled={!notificationsEnabled}
            />
          </View>

          <View className="flex-row justify-between items-center py-3">
            <Text className="text-base text-gray-900">
              Actualizaciones de torneos
            </Text>
            <Switch
              value={tournamentUpdates}
              onValueChange={setTournamentUpdates}
              trackColor={{ false: '#d1d5db', true: '#0ea5e9' }}
              disabled={!notificationsEnabled}
            />
          </View>
        </Card>

        {/* Security */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Seguridad
          </Text>

          {!showChangePassword ? (
            <TouchableOpacity
              className="py-3"
              onPress={() => setShowChangePassword(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-gray-900">Cambiar contraseña</Text>
                <Text className="text-gray-400">›</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View>
              <Input
                label="Contraseña Actual"
                placeholder="••••••••"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />

              <Input
                label="Nueva Contraseña"
                placeholder="••••••••"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <Input
                label="Confirmar Contraseña"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <View className="flex-row space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onPress={() => setShowChangePassword(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onPress={handleChangePassword}
                  loading={changePasswordMutation.isPending}
                >
                  Guardar
                </Button>
              </View>
            </View>
          )}
        </Card>

        {/* App Settings */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Aplicación
          </Text>

          <TouchableOpacity className="py-3 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-gray-900">Idioma</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-600 mr-2">Español</Text>
                <Text className="text-gray-400">›</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="py-3" onPress={handleClearCache}>
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-gray-900">Limpiar caché</Text>
              <Text className="text-gray-400">›</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* App Info */}
        <Card>
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Información
          </Text>

          <View className="py-2">
            <Text className="text-sm text-gray-600">Versión</Text>
            <Text className="text-base text-gray-900">1.0.0</Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
