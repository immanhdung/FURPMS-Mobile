import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from '@/features/notification/hooks/useNotifications';
import { NotificationItem } from '@/features/notification/components/NotificationItem';
import { NotificationDetailModal } from '@/features/notification/components/NotificationDetailModal';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import type { AppNotification } from '@/features/notification/types/notification.types';

export default function ReviewNotificationsScreen() {
  const { t } = useTranslation('notification');
  const { colors } = useTheme();
  const { data, isLoading, isError, refetch, isFetching } = useNotifications();
  const { data: unreadData } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  const unreadCount = unreadData ?? 0;

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handlePress = useCallback(
    (notification: AppNotification) => {
      if (!notification.read) markAsRead(notification.id);
      setSelectedNotification(notification);
    },
    [markAsRead],
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      <View className="px-5 pt-6 pb-4 flex-row items-center justify-between">
        <View className="gap-0.5">
          <Text className="text-neutral-900 dark:text-neutral-50 text-2xl font-bold tracking-tight">
            {t('title')}
          </Text>
          <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
            {unreadCount > 0 ? t('unreadCount', { count: unreadCount }) : t('allCaughtUp')}
          </Text>
        </View>
        {/* Luôn hiện nút "Đọc tất cả", disable khi không có thông báo chưa đọc */}
        <TouchableOpacity
          onPress={() => markAllAsRead()}
          activeOpacity={0.7}
          disabled={isMarkingAll || unreadCount === 0}
          className="px-3 py-1.5 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20"
          style={{ opacity: (isMarkingAll || unreadCount === 0) ? 0.4 : 1 }}
        >
          <Text className="text-violet-600 dark:text-violet-400 text-xs font-semibold">
            Đọc tất cả
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingState message={t('loading')} />
      ) : isError ? (
        <ErrorState
          title={t('loadErrorTitle')}
          message={t('loadErrorMessage')}
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => handlePress(item)}
            />
          )}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={onRefresh}
              tintColor={colors.accent.primary}
              colors={[colors.accent.primary]}
            />
          }
          ItemSeparatorComponent={() => (
            <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-4" />
          )}
          ListFooterComponent={<View className="h-8" />}
          ListEmptyComponent={
            <EmptyState
              title={t('allCaughtUp')}
              description={t('emptyDescription')}
            />
          }
        />
      )}

      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </SafeAreaView>
  );
}
