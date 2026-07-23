import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import { useNotificationStore } from '@/stores/notification.store';
import { pushNotificationService } from '@/services/push-notification.service';
import { useAuthStore } from '@/stores/auth.store';

// Configure foreground notification handling globally
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// Deep-link navigation targets embedded in notification data
function resolveNotificationRoute(data: Record<string, unknown>): string | null {
  const { type, targetId } = data as { type?: string; targetId?: string };
  if (!type || !targetId) return null;

  const routes: Record<string, (id: string) => string> = {
    PROPOSAL_UPDATE: (id) => `/(faculty)/proposals/${id}`,
    REVIEW_ASSIGNED: (id) => `/(review)/queue/${id}`,
    REVIEW_DUE: (id) => `/(review)/queue/${id}`,
    MEETING_REMINDER: (id) => `/(faculty)/meetings/${id}`,
    REVIEW_MEETING: (id) => `/(review)/meetings/${id}`,
    NOTIFICATION: () => `/(faculty)/notifications`,
  };

  return routes[type]?.(targetId) ?? null;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const router = useRouter();
  const { setPermission, setPushToken } = useNotificationStore();
  const { isAuthenticated } = useAuthStore();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const foregroundListener = useRef<Notifications.EventSubscription | null>(null);

  // Register push token once authenticated
  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (!isAuthenticated) return;

    async function registerToken() {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setPermission(granted);

      if (granted) {
        const token = await pushNotificationService.registerDeviceToken();
        if (token) setPushToken(token);
      }
    }

    registerToken();
  }, [isAuthenticated, setPermission, setPushToken]);

  // Foreground notification listener — update badge + unread count
  useEffect(() => {
    if (Platform.OS === 'web') return;
    foregroundListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data as Record<string, unknown>;
        if (data?.type === 'UNREAD_COUNT') {
          const count = typeof data.count === 'number' ? data.count : 0;
          useNotificationStore.getState().setUnreadCount(count);
        }
      },
    );

    return () => {
      foregroundListener.current?.remove();
    };
  }, []);

  // Tap response listener — navigate to the relevant screen
  useEffect(() => {
    if (Platform.OS === 'web') return;
    // Handle tap on notification that launched the app
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const data = response.notification.request.content.data as Record<string, unknown>;
      const route = resolveNotificationRoute(data);
      if (route) router.push(route as never);
    }).catch(() => {});

    // Handle tap while app is running / in background
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as Record<string, unknown>;
        const route = resolveNotificationRoute(data);
        if (route) router.push(route as never);
      },
    );

    return () => {
      responseListener.current?.remove();
    };
  }, [router]);

  // App foreground: clear badge and refresh unread count
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        pushNotificationService.setBadgeCount(0);
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);

  return <>{children}</>;
}
