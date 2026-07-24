import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorState({
  title,
  message,
  onRetry,
  fullScreen = true,
}: ErrorStateProps) {
  const { t } = useTranslation('common');
  const resolvedTitle = title ?? t('states.errorTitle');
  const resolvedMessage = message ?? t('states.errorMessage');

  return (
    <View
      className={`items-center justify-center gap-4 px-8 py-12 ${fullScreen ? 'flex-1' : ''}`}
    >
      <View className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-dark-100 items-center justify-center">
        <Text className="text-3xl">⚠️</Text>
      </View>
      <View className="items-center gap-2 max-w-xs">
        <Text className="text-neutral-900 dark:text-neutral-50 text-lg font-semibold text-center">
          {resolvedTitle}
        </Text>
        <Text className="text-neutral-500 dark:text-dark-500 text-sm text-center font-sans leading-5">
          {resolvedMessage}
        </Text>
      </View>
      {onRetry && (
        <Button label={t('buttons.tryAgain')} onPress={onRetry} variant="secondary" size="sm" />
      )}
    </View>
  );
}
