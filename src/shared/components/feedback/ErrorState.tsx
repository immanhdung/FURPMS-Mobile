import { View, Text } from 'react-native';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred. Please try again.',
  onRetry,
  fullScreen = true,
}: ErrorStateProps) {
  return (
    <View
      className={`items-center justify-center gap-4 px-8 py-12 ${fullScreen ? 'flex-1' : ''}`}
    >
      <View className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-dark-100 items-center justify-center">
        <Text className="text-3xl">⚠️</Text>
      </View>
      <View className="items-center gap-2 max-w-xs">
        <Text className="text-neutral-900 dark:text-neutral-50 text-lg font-semibold text-center">
          {title}
        </Text>
        <Text className="text-neutral-500 dark:text-dark-500 text-sm text-center font-sans leading-5">
          {message}
        </Text>
      </View>
      {onRetry && (
        <Button label="Try Again" onPress={onRetry} variant="secondary" size="sm" />
      )}
    </View>
  );
}
