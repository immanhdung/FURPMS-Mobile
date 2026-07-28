import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useNotificationStore } from '@/stores/notification.store';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabItem {
  name: string;
  title: string;
  icon: IoniconsName;
  iconFocused: IoniconsName;
}

function useTabs(): TabItem[] {
  const { t } = useTranslation('common');
  return [
    { name: 'index', title: t('tabs.dashboard'), icon: 'home-outline', iconFocused: 'home' },
    {
      name: 'proposals',
      title: t('tabs.proposals'),
      icon: 'document-text-outline',
      iconFocused: 'document-text',
    },
    {
      name: 'reports',
      title: t('tabs.reports'),
      icon: 'bar-chart-outline',
      iconFocused: 'bar-chart',
    },
    {
      name: 'notifications/index',
      title: t('tabs.inbox'),
      icon: 'notifications-outline',
      iconFocused: 'notifications',
    },
    {
      name: 'profile/index',
      title: t('tabs.profile'),
      icon: 'person-outline',
      iconFocused: 'person',
    },
  ];
}

function NotificationTabIcon({
  color,
  focused,
  size,
}: {
  color: string;
  focused: boolean;
  size: number;
}) {
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <View>
      <Ionicons
        name={focused ? 'notifications' : 'notifications-outline'}
        size={size}
        color={color}
      />
      {unreadCount > 0 && (
        <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-4 h-4 items-center justify-center px-1">
          <Text className="text-white text-xs font-bold" style={{ lineHeight: 14 }}>
            {unreadCount > 99 ? '99+' : String(unreadCount)}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function FacultyLayout() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const TABS = useTabs();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.5)',
          elevation: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarBackground: () => (
          <BlurView intensity={70} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
        ),
        tabBarActiveTintColor: colors.tab.active,
        tabBarInactiveTintColor: colors.tab.inactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Inter_500Medium',
        },
      }}
    >
      {TABS.map(({ name, title, icon, iconFocused }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon:
              name === 'notifications/index'
                ? ({ color, focused, size }) => (
                    <NotificationTabIcon
                      color={color}
                      focused={focused}
                      size={size}
                    />
                  )
                : ({ color, focused, size }) => (
                    <Ionicons
                      name={focused ? iconFocused : icon}
                      size={size}
                      color={color}
                    />
                  ),
          }}
        />
      ))}
    </Tabs>
  );
}
