import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import type { TouchableOpacityProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const containerVariant: Record<Variant, string> = {
  primary: 'bg-violet-500 dark:bg-violet-400',
  secondary: 'bg-neutral-100 dark:bg-dark-200',
  ghost: 'bg-transparent',
  danger: 'bg-red-500 dark:bg-red-400',
  outline: 'bg-transparent border border-violet-500 dark:border-violet-400',
};

const labelVariant: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-neutral-900 dark:text-neutral-50',
  ghost: 'text-violet-500 dark:text-violet-400',
  danger: 'text-white',
  outline: 'text-violet-500 dark:text-violet-400',
};

const containerSize: Record<Size, string> = {
  sm: 'px-3 py-2 rounded-lg gap-1.5',
  md: 'px-4 py-3 rounded-xl gap-2',
  lg: 'px-5 py-3.5 rounded-xl gap-2',
};

const labelSize: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base',
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center',
        containerVariant[variant],
        containerSize[size],
        fullWidth ? 'w-full' : 'self-start',
        isDisabled ? 'opacity-50' : 'opacity-100',
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' ? '#5E6AD2' : '#FFFFFF'}
        />
      ) : (
        iconLeft && <View>{iconLeft}</View>
      )}
      <Text className={`font-semibold ${labelVariant[variant]} ${labelSize[size]}`}>
        {label}
      </Text>
      {!loading && iconRight && <View>{iconRight}</View>}
    </TouchableOpacity>
  );
}
