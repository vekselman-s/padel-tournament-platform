import React from 'react';
import { View, Text, Image, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface AvatarProps extends ViewProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({
  name,
  imageUrl,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-xl',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View
      className={cn(
        'rounded-full bg-primary-500 items-center justify-center overflow-hidden',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <Text
          className={cn(
            'text-white font-semibold',
            textSizeClasses[size]
          )}
        >
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}
