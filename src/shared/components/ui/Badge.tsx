import { View, Text } from 'react-native';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const styles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: {
    bg: 'bg-neutral-100 dark:bg-dark-200',
    text: 'text-neutral-700 dark:text-neutral-300',
  },
  success: {
    bg: 'bg-emerald-100 dark:bg-emerald-700',
    text: 'text-emerald-700 dark:text-emerald-100',
  },
  warning: {
    bg: 'bg-amber-100 dark:bg-amber-700',
    text: 'text-amber-700 dark:text-amber-100',
  },
  danger: {
    bg: 'bg-red-100 dark:bg-red-700',
    text: 'text-red-700 dark:text-red-100',
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-700',
    text: 'text-blue-700 dark:text-blue-100',
  },
  purple: {
    bg: 'bg-violet-100 dark:bg-violet-700',
    text: 'text-violet-700 dark:text-violet-100',
  },
};

export function Badge({ label, variant = 'default', size = 'sm' }: BadgeProps) {
  const { bg, text } = styles[variant];
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <View className={`${bg} ${padding} rounded-md self-start`}>
      <Text className={`${text} ${textSize} font-medium`}>{label}</Text>
    </View>
  );
}
