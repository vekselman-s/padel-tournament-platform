import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-100 p-4',
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
