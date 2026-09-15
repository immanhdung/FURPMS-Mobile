import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { AppNotification } from '../types/notification.types';

export interface NotificationService {
  list(): Promise<AppNotification[]>;
  count(): Promise<number>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}

interface NotificationDto {
  id: string;
  type: any;
  title: string;
  message: string;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
  actionUrl?: string | null;
  link?: string | null;
}

function toAppNotification(n: NotificationDto): AppNotification {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    read: Boolean(n.isRead ?? n.read),
    createdAt: n.createdAt,
    link: n.link ?? n.actionUrl ?? null,
  };
}

const realNotificationService: NotificationService = {
  async list() {
    const { data } = await httpClient.get<ApiResponse<NotificationDto[]>>('/notifications');
    return (data.data ?? []).map(toAppNotification);
  },

  async count() {
    const { data } = await httpClient.get<ApiResponse<number | { unread: number; total?: number }>>('/notifications/count');
    const raw = data.data;
    if (typeof raw === 'number') return raw;
    return raw?.unread ?? 0;
  },

  async markAsRead(id) {
    await httpClient.patch<ApiResponse<null>>(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    await httpClient.patch<ApiResponse<null>>('/notifications/read-all');
  },
};

export const notificationService: NotificationService = realNotificationService;
