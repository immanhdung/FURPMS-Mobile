import { useCallback } from 'react';
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
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';

export default function ReviewNotificationsScreen() {
  const { t } = useTranslation('notification');
  const { colors } = useTheme();
  const { data, isLoading, isError, refetch, isFetching } = useNotifications();
  const { data: unreadData } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  const unreadCount = unreadData ?? 0;

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handlePress = useCallback(
    (id: string, isRead: boolean) => {
      if (!isRead) markAsRead(id);
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
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={() => markAllAsRead()}
            activeOpacity={0.7}
            disabled={isMarkingAll}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-dark-200"
            style={{ opacity: isMarkingAll ? 0.5 : 1 }}
          >
            <Text className="text-neutral-600 dark:text-dark-500 text-xs font-medium">
              {t('markAllRead')}
            </Text>
          </TouchableOpacity>
        )}
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
              onPress={() => handlePress(item.id, item.read)}
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
    </SafeAreaView>
  );
}
