import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { useNotificationStore } from '@/stores/notification.store';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { AppNotification } from '../types/notification.types';

export function useNotifications() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.feed,
    queryFn: () => notificationService.list(),
  });
}

export function useUnreadCount() {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  return useQuery({
    queryKey: QUERY_KEYS.notifications.count,
    queryFn: async () => {
      const count = await notificationService.count();
      setUnreadCount(count);
      return count;
    },
    refetchInterval: 60_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { decrementUnread } = useNotificationStore();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<AppNotification[]>(QUERY_KEYS.notifications.feed, (old) => {
        if (!old) return [];
        return old.map((n) => (n.id === id ? { ...n, read: true } : n));
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.feed });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.count });
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
      queryClient.setQueryData<AppNotification[]>(QUERY_KEYS.notifications.feed, (old) => {
        if (!old) return [];
        return old.map((n) => ({ ...n, read: true }));
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.feed });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.count });
      setUnreadCount(0);
    },
  });
}
