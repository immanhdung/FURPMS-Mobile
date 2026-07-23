import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { StyleSheet } from 'react-native';

interface CardProps extends Omit<ViewProps, 'style'> {
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
}

export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  const { colors } = useTheme();

  const shadow = variant === 'elevated' ? colors.shadow.md : undefined;

  const baseClass = 'bg-neutral-0 dark:bg-dark-50 rounded-xl';
  const variantClass = {
    default: '',
    elevated: '',
    outlined: 'border border-neutral-100 dark:border-dark-200',
  }[variant];

  return (
    <View
      className={`${baseClass} ${variantClass} ${className}`}
      style={shadow}
      {...props}
    >
      {children}
    </View>
  );
}
