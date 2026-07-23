import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import { useNotificationStore } from '@/stores/notification.store';
import { pushNotificationService } from '@/services/push-notification.service';
import { useAuthStore } from '@/stores/auth.store';
import { ROLES } from '@/constants/roles';

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

// Deep-link navigation targets by notification type. The real AppNotification.link field's exact
// format isn't guaranteed to map onto app routes, so we route to the relevant list screen for the
// current role rather than assuming a specific item id is reachable from the payload.
function resolveNotificationRoute(data: Record<string, unknown>, isReviewer: boolean): string | null {
  const type = (data as { type?: string }).type;
  if (!type) return null;

  if (isReviewer) {
    const reviewerRoutes: Record<string, string> = {
      PROPOSAL: '/(review)/queue',
      REVIEW: '/(review)/queue',
      COUNCIL: '/(review)/queue',
      MEETING: '/(review)/meetings',
      CONTRACT: '/(review)/queue',
      SYSTEM: '/(review)/notifications',
    };
    return reviewerRoutes[type] ?? null;
  }

  const facultyRoutes: Record<string, string> = {
    PROPOSAL: '/(faculty)/proposals',
    REVIEW: '/(faculty)/proposals',
    COUNCIL: '/(faculty)/proposals',
    MEETING: '/(faculty)/notifications',
    CONTRACT: '/(faculty)/reports',
    SYSTEM: '/(faculty)/notifications',
  };
  return facultyRoutes[type] ?? null;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const router = useRouter();
  const { setPermission, setPushToken } = useNotificationStore();
  const { isAuthenticated, user } = useAuthStore();
  const isReviewer = !user?.roles?.includes(ROLES.FACULTY) && !!user?.roles?.includes(ROLES.REVIEW_COMMITTEE);
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
      const route = resolveNotificationRoute(data, isReviewer);
      if (route) router.push(route as never);
    }).catch(() => {});

    // Handle tap while app is running / in background
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as Record<string, unknown>;
        const route = resolveNotificationRoute(data, isReviewer);
        if (route) router.push(route as never);
      },
    );

    return () => {
      responseListener.current?.remove();
    };
  }, [router, isReviewer]);

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
