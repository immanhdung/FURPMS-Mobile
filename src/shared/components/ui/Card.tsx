import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { GlassSurface } from './GlassSurface';

interface CardProps extends Omit<ViewProps, 'style'> {
  /** "glass" is the default liquid-glass material; "solid" opts out for surfaces that need a flat, fully opaque background. */
  variant?: 'glass' | 'elevated' | 'solid';
  className?: string;
}

export function Card({ variant = 'glass', className = '', children, ...props }: CardProps) {
  const { colors } = useTheme();

  if (variant !== 'solid') {
    return (
      <GlassSurface
        intensity={variant === 'elevated' ? 55 : 40}
        className={className}
        style={variant === 'elevated' ? colors.shadow.md : undefined}
      >
        {children}
      </GlassSurface>
    );
  }

  return (
    <View className={`bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 ${className}`} {...props}>
      {children}
    </View>
  );
}
