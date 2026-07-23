import { create } from 'zustand';

interface NotificationState {
  unreadCount: number;
  pushToken: string | null;
  hasPermission: boolean;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  setPushToken: (token: string) => void;
  setPermission: (value: boolean) => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  unreadCount: 0,
  pushToken: null,
  hasPermission: false,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnread: () => set({ unreadCount: Math.max(0, get().unreadCount - 1) }),
  setPushToken: (token) => set({ pushToken: token }),
  setPermission: (value) => set({ hasPermission: value }),
}));
