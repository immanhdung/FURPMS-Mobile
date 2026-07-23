import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { AppNotification } from '../types/notification.types';

export interface NotificationService {
  list(): Promise<AppNotification[]>;
  count(): Promise<number>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}

const realNotificationService: NotificationService = {
  async list() {
    const { data } = await httpClient.get<ApiResponse<AppNotification[]>>('/notifications');
    return data.data;
  },

  async count() {
    const { data } = await httpClient.get<ApiResponse<number>>('/notifications/count');
    return data.data;
  },

  async markAsRead(id) {
    await httpClient.patch<ApiResponse<null>>(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    await httpClient.patch<ApiResponse<null>>('/notifications/read-all');
  },
};

export const notificationService: NotificationService = realNotificationService;
