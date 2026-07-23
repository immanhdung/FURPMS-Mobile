import { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { colors } = useTheme();
  const { data, isLoading, isError, refetch, isFetching } = useNotifications();
  const { data: unreadData } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  const unreadCount = unreadData?.count ?? 0;

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
            Inbox
          </Text>
          <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
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
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <LoadingState message="Loading notifications…" />
      ) : isError ? (
        <ErrorState
          title="Could not load notifications"
          message="Check your connection and try again."
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => handlePress(item.id, item.isRead)}
            />
          )}
          contentContainerStyle={{ flexGrow: 1 }}
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
              title="All caught up"
              description="No notifications right now. We'll notify you when something needs your attention."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
