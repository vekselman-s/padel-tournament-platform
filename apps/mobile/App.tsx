import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/lib/store/auth-store';
import { useUIStore } from './src/lib/store/ui-store';
import { registerForPushNotifications } from './src/lib/notifications';
import { LoadingSpinner } from './src/components/ui/LoadingSpinner';

// Import NativeWind
import './global.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function ToastNotification() {
  const toast = useUIStore((state) => state.toast);

  if (!toast.visible) return null;

  const bgColor =
    toast.type === 'success'
      ? 'bg-green-500'
      : toast.type === 'error'
      ? 'bg-red-500'
      : 'bg-blue-500';

  return (
    <View
      className={`absolute top-12 left-4 right-4 ${bgColor} rounded-lg p-4 shadow-lg z-50`}
    >
      <Text className="text-white font-semibold">{toast.message}</Text>
    </View>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const setup = async () => {
      try {
        // Initialize auth state from storage
        await initialize();

        // Register for push notifications
        await registerForPushNotifications();
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        setIsReady(true);
      }
    };

    setup();
  }, []);

  if (!isReady) {
    return <LoadingSpinner message="Cargando aplicación..." />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <AppNavigator />
          <ToastNotification />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
