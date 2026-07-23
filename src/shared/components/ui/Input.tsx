import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function Input({ label, error, hint, required, ...props }: InputProps) {
  const { colors } = useTheme();

  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {label}
          {required && <Text className="text-red-500"> *</Text>}
        </Text>
      )}
      <TextInput
        className={[
          'bg-neutral-50 dark:bg-dark-100 rounded-xl px-4 py-3',
          'text-neutral-900 dark:text-neutral-50 font-sans text-base',
          'border',
          error
            ? 'border-red-500 dark:border-red-400'
            : 'border-neutral-200 dark:border-dark-200',
        ].join(' ')}
        placeholderTextColor={colors.text.tertiary}
        autoCorrect={false}
        {...props}
      />
      {error && (
        <Text className="text-xs font-sans text-red-500 dark:text-red-400">
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text className="text-xs font-sans text-neutral-500 dark:text-dark-500">
          {hint}
        </Text>
      )}
    </View>
  );
}
