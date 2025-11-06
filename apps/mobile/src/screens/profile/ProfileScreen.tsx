import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/auth-store';
import { useMyTournaments } from '@/lib/queries/tournaments';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { data: myTournaments } = useMyTournaments();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* User Info */}
        <Card className="mb-4 items-center">
          <Avatar name={user?.name || ''} size="xl" className="mb-4" />
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {user?.name}
          </Text>
          <Text className="text-base text-gray-600 mb-4">{user?.email}</Text>

          <Button
            variant="outline"
            size="sm"
            onPress={() => navigation.navigate('EditProfile' as never)}
          >
            Editar Perfil
          </Button>
        </Card>

        {/* Stats */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Estadísticas
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-3xl font-bold text-primary-500">
                {myTournaments?.length || 0}
              </Text>
              <Text className="text-sm text-gray-600">Torneos</Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl font-bold text-green-500">0</Text>
              <Text className="text-sm text-gray-600">Victorias</Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl font-bold text-red-500">0</Text>
              <Text className="text-sm text-gray-600">Derrotas</Text>
            </View>
          </View>
        </Card>

        {/* Menu Options */}
        <Card className="mb-4">
          <TouchableOpacity
            className="py-4 border-b border-gray-100"
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">⚙️</Text>
                <Text className="text-base text-gray-900">Configuración</Text>
              </View>
              <Text className="text-gray-400">›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="py-4 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🏆</Text>
                <Text className="text-base text-gray-900">Mis Torneos</Text>
              </View>
              <Text className="text-gray-400">›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="py-4 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">📊</Text>
                <Text className="text-base text-gray-900">Estadísticas</Text>
              </View>
              <Text className="text-gray-400">›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="py-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">ℹ️</Text>
                <Text className="text-base text-gray-900">Acerca de</Text>
              </View>
              <Text className="text-gray-400">›</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <Button variant="danger" onPress={handleLogout}>
          Cerrar Sesión
        </Button>
      </View>
    </ScrollView>
  );
}
