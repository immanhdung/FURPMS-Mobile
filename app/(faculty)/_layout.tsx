import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
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
  const { colors } = useTheme();
  const TABS = useTabs();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tab.bar,
          borderTopColor: colors.tab.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
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
