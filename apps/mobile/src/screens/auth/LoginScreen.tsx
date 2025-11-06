import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '@/lib/queries/auth';
import { useUIStore } from '@/lib/store/ui-store';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const loginMutation = useLogin();
  const showToast = useUIStore((state) => state.showToast);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await loginMutation.mutateAsync({ email, password });
      showToast('Inicio de sesión exitoso', 'success');
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Error al iniciar sesión',
        'error'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center p-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            Bienvenido 🎾
          </Text>
          <Text className="text-lg text-gray-600">
            Inicia sesión para continuar
          </Text>
        </View>

        <View className="mb-6">
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
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            error={errors.password}
          />
        </View>

        <Button
          onPress={handleLogin}
          loading={loginMutation.isPending}
          className="mb-4"
        >
          Iniciar Sesión
        </Button>

        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600 mr-1">¿No tienes cuenta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
            <Text className="text-primary-500 font-semibold">Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
