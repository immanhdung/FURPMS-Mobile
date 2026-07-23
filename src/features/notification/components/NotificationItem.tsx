import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { formatRelative } from '@/utils/date';
import type { AppNotification, NotificationType } from '../types/notification.types';

const typeConfig: Record<NotificationType, { icon: string; bg: string; color: string }> = {
  PROPOSAL: { icon: 'document-text', bg: 'bg-blue-100 dark:bg-blue-900/30', color: '#3B82F6' },
  REVIEW: { icon: 'clipboard', bg: 'bg-violet-100 dark:bg-violet-900/30', color: '#5E6AD2' },
  COUNCIL: { icon: 'people', bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: '#22C55E' },
  MEETING: { icon: 'calendar', bg: 'bg-amber-100 dark:bg-amber-900/30', color: '#F59E0B' },
  CONTRACT: { icon: 'document-lock', bg: 'bg-orange-100 dark:bg-orange-900/30', color: '#F97316' },
  SYSTEM: { icon: 'information-circle', bg: 'bg-neutral-100 dark:bg-dark-200', color: '#6E6E80' },
};

interface NotificationItemProps {
  notification: AppNotification;
  onPress: () => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const config = typeConfig[notification.type] ?? typeConfig.SYSTEM;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-start gap-3 px-4 py-4 ${
        !notification.read ? 'bg-violet-50/50 dark:bg-violet-900/10' : ''
      }`}
    >
      <View className={`${config.bg} w-10 h-10 rounded-xl items-center justify-center flex-shrink-0`}>
        <Ionicons
          name={config.icon as React.ComponentProps<typeof Ionicons>['name']}
          size={20}
          color={config.color}
        />
      </View>

      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text
            className={`text-sm leading-snug flex-1 ${
              notification.read
                ? 'text-neutral-700 dark:text-neutral-200 font-sans'
                : 'text-neutral-900 dark:text-neutral-50 font-semibold'
            }`}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text className="text-neutral-400 dark:text-dark-500 text-xs font-sans flex-shrink-0">
            {formatRelative(notification.createdAt)}
          </Text>
        </View>

        <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans leading-snug" numberOfLines={2}>
          {notification.message}
        </Text>
      </View>

      {!notification.read && (
        <View className="w-2 h-2 rounded-full bg-violet-500 dark:bg-violet-400 mt-1 flex-shrink-0" />
      )}
    </TouchableOpacity>
  );
}
