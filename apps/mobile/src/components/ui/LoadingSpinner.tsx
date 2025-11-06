import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  className?: string;
}

export function LoadingSpinner({
  message,
  size = 'large',
  className,
}: LoadingSpinnerProps) {
  return (
    <View
      className={cn(
        'flex-1 items-center justify-center p-4',
        className
      )}
    >
      <ActivityIndicator size={size} color="#0ea5e9" />
      {message && (
        <Text className="text-gray-600 mt-4 text-center">{message}</Text>
      )}
    </View>
  );
}
