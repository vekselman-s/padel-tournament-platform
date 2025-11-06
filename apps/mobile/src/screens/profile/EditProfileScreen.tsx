import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUpdateProfile } from '@/lib/queries/auth';
import { useUIStore } from '@/lib/store/ui-store';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const updateProfileMutation = useUpdateProfile();
  const showToast = useUIStore((state) => state.showToast);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};

    if (!name) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await updateProfileMutation.mutateAsync({
        name,
        email,
        phone: phone || undefined,
      });
      showToast('Perfil actualizado exitosamente', 'success');
      navigation.goBack();
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Error al actualizar perfil',
        'error'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="p-4">
          {/* Avatar */}
          <View className="items-center mb-6">
            <Avatar name={name} size="xl" />
          </View>

          {/* Form */}
          <Input
            label="Nombre Completo"
            placeholder="Juan Pérez"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={errors.name}
          />

          <Input
            label="Correo Electrónico"
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
          />

          <Input
            label="Teléfono"
            placeholder="+34 123 456 789"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
          />

          <Button
            onPress={handleSubmit}
            loading={updateProfileMutation.isPending}
          >
            Guardar Cambios
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
