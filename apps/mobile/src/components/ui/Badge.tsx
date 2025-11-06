import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({
  children,
  variant = 'default',
  className,
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <View
      className={cn(
        'px-2 py-1 rounded-full self-start',
        variantClasses[variant].split(' ')[0],
        className
      )}
      {...props}
    >
      <Text
        className={cn(
          'text-xs font-medium',
          variantClasses[variant].split(' ')[1]
        )}
      >
        {children}
      </Text>
    </View>
  );
}
