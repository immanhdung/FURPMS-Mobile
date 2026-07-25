import { useState } from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Icon rendered inside the field, left-aligned (e.g. a mail or lock glyph). */
  iconLeft?: React.ReactNode;
  /** Element rendered inside the field, right-aligned (e.g. a show/hide password toggle). */
  rightElement?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  required,
  iconLeft,
  rightElement,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderClass = error
    ? 'border-red-500 dark:border-red-400'
    : isFocused
    ? 'border-violet-500 dark:border-violet-400'
    : 'border-neutral-200 dark:border-dark-200';

  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {label}
          {required && <Text className="text-red-500"> *</Text>}
        </Text>
      )}
      <View className="justify-center">
        {iconLeft && (
          <View className="absolute left-3.5 top-0 bottom-0 justify-center z-10" pointerEvents="none">
            {iconLeft}
          </View>
        )}
        <TextInput
          className={[
            'bg-neutral-50 dark:bg-dark-100 rounded-xl py-3',
            iconLeft ? 'pl-11' : 'pl-4',
            rightElement ? 'pr-11' : 'pr-4',
            'text-neutral-900 dark:text-neutral-50 font-sans text-base',
            'border',
            borderClass,
          ].join(' ')}
          placeholderTextColor={colors.text.tertiary}
          autoCorrect={false}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {rightElement && (
          <View className="absolute right-3.5 top-0 bottom-0 justify-center">{rightElement}</View>
        )}
      </View>
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
