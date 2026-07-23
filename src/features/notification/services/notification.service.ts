import { httpClient } from '@/services/http.client';
import type {
  Notification,
  NotificationSummary,
  UnreadCountResponse,
} from '../types/notification.types';

export interface NotificationService {
  getNotifications(): Promise<NotificationSummary[]>;
  getNotificationById(id: string): Promise<Notification>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  getUnreadCount(): Promise<UnreadCountResponse>;
}

const realNotificationService: NotificationService = {
  async getNotifications() {
    const { data } = await httpClient.get<NotificationSummary[]>('/notifications');
    return data;
  },

  async getNotificationById(id) {
    const { data } = await httpClient.get<Notification>(`/notifications/${id}`);
    return data;
  },

  async markAsRead(id) {
    await httpClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    await httpClient.patch('/notifications/read-all');
  },

  async getUnreadCount() {
    const { data } = await httpClient.get<UnreadCountResponse>('/notifications/unread-count');
    return data;
  },
};

export const notificationService: NotificationService = realNotificationService;
