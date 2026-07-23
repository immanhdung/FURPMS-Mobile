import { View, Text } from 'react-native';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  action?: { label: string; onPress: () => void };
  fullScreen?: boolean;
}

export function EmptyState({
  title,
  description,
  icon = '📭',
  action,
  fullScreen = true,
}: EmptyStateProps) {
  return (
    <View
      className={`items-center justify-center gap-4 px-8 py-12 ${fullScreen ? 'flex-1' : ''}`}
    >
      <View className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-dark-100 items-center justify-center">
        <Text className="text-3xl">{icon}</Text>
      </View>
      <View className="items-center gap-2 max-w-xs">
        <Text className="text-neutral-900 dark:text-neutral-50 text-lg font-semibold text-center">
          {title}
        </Text>
        {description && (
          <Text className="text-neutral-500 dark:text-dark-500 text-sm text-center font-sans leading-5">
            {description}
          </Text>
        )}
      </View>
      {action && (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="secondary"
          size="sm"
        />
      )}
    </View>
  );
}
