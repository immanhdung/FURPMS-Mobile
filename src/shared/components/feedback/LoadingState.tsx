import { View, ActivityIndicator, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({
  message,
  fullScreen = true,
}: LoadingStateProps) {
  const { colors } = useTheme();
  const { t } = useTranslation('common');

  return (
    <View className={`items-center justify-center gap-3 p-8 ${fullScreen ? 'flex-1' : ''}`}>
      <ActivityIndicator size="large" color={colors.accent.primary} />
      <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
        {message ?? t('states.loading')}
      </Text>
    </View>
  );
}
