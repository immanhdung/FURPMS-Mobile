import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { httpClient } from './http.client';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channelId?: string;
}

export interface PushNotificationService {
  registerDeviceToken(): Promise<string | null>;
  scheduleLocalNotification(payload: PushNotificationPayload): Promise<string>;
  cancelNotification(id: string): Promise<void>;
  cancelAllNotifications(): Promise<void>;
  getBadgeCount(): Promise<number>;
  setBadgeCount(count: number): Promise<void>;
}

async function ensureAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'General',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#7C3AED',
  });

  await Notifications.setNotificationChannelAsync('reviews', {
    name: 'Review Assignments',
    description: 'Notifications for new review assignments and deadlines',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 300, 200, 300],
    lightColor: '#3B82F6',
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('proposals', {
    name: 'Proposal Updates',
    description: 'Status changes and feedback on your research proposals',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#10B981',
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('meetings', {
    name: 'Meeting Reminders',
    description: 'Upcoming meeting alerts and schedule changes',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 200, 500],
    lightColor: '#F59E0B',
    sound: 'default',
  });
}

export const pushNotificationService: PushNotificationService = {
  async registerDeviceToken() {
    if (Platform.OS === 'web') return null;
    if (!Device.isDevice) {
      console.warn('[Push] Skipping token registration on simulator/emulator');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Push] Permission denied');
      return null;
    }

    await ensureAndroidChannels();

    let token: string;
    try {
      const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
      const result = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );
      token = result.data;
    } catch (err) {
      console.warn('[Push] Token fetch failed:', err);
      return null;
    }

    // The real backend has no push-token registration endpoint yet. Skip the network call (it's
    // a guaranteed 404 on every cold start) but still return the local Expo token so in-app
    // local notifications keep working. Flip EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION once the
    // backend adds the endpoint.
    if (process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION === 'true') {
      try {
        await httpClient.post('/users/me/push-token', {
          token,
          platform: Platform.OS,
          deviceName: Device.deviceName ?? undefined,
        });
      } catch {
        // Swallow — token registration failure must not block the app
      }
    }

    return token;
  },

  async scheduleLocalNotification({ title, body, data, channelId }) {
    if (Platform.OS === 'web') return '';
    return Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data ?? {},
        sound: true,
        ...(Platform.OS === 'android' && { channelId: channelId ?? 'default' }),
      },
      trigger: null,
    });
  },

  async cancelNotification(id) {
    if (Platform.OS === 'web') return;
    await Notifications.cancelScheduledNotificationAsync(id);
  },

  async cancelAllNotifications() {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async getBadgeCount() {
    if (Platform.OS === 'web') return 0;
    return Notifications.getBadgeCountAsync();
  },

  async setBadgeCount(count) {
    if (Platform.OS === 'web') return;
    await Notifications.setBadgeCountAsync(count);
  },
};
