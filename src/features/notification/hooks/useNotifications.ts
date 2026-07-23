import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { useNotificationStore } from '@/stores/notification.store';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useNotifications() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.feed,
    queryFn: () => notificationService.getNotifications(),
  });
}

export function useUnreadCount() {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  return useQuery({
    queryKey: QUERY_KEYS.notifications.unreadCount,
    queryFn: async () => {
      const result = await notificationService.getUnreadCount();
      setUnreadCount(result.count);
      return result;
    },
    refetchInterval: 60_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { decrementUnread } = useNotificationStore();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.feed });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.unreadCount });
      decrementUnread();
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.feed });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.unreadCount });
      setUnreadCount(0);
    },
  });
}
