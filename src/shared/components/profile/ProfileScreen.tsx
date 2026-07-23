import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge, type BadgeVariant } from '@/shared/components/ui/Badge';
import { formatDateTime } from '@/utils/date';
import { ChangePasswordSheet } from './ChangePasswordSheet';

function SettingsRow({
  icon,
  label,
  onPress,
  dangerous,
  loading,
  showChevron = true,
  value,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  dangerous?: boolean;
  loading?: boolean;
  showChevron?: boolean;
  value?: string;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={loading}
      className="flex-row items-center px-5 py-4"
      style={{ opacity: loading ? 0.5 : 1 }}
    >
      <Ionicons
        name={icon as React.ComponentProps<typeof Ionicons>['name']}
        size={20}
        color={dangerous ? colors.accent.danger : colors.icon.default}
      />
      <Text
        className={`flex-1 ml-3 text-base font-sans ${
          dangerous ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-50'
        }`}
      >
        {label}
      </Text>
      {value && (
        <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans mr-2">{value}</Text>
      )}
      {showChevron && <Ionicons name="chevron-forward" size={16} color={colors.icon.muted} />}
    </TouchableOpacity>
  );
}

interface ProfileScreenProps {
  roleLabel: string;
  badgeVariant: BadgeVariant;
  footerLabel: string;
}

export function ProfileScreen({ roleLabel, badgeVariant, footerLabel }: ProfileScreenProps) {
  const { user } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: profile, refetch, isFetching } = useProfile();
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  if (!user) return null;

  const displayName = profile?.fullName ?? user.fullName;
  const displayEmail = profile?.email ?? user.email;
  const status = profile?.status ?? user.status;
  const lastLoginAt = profile?.lastLoginAt ?? user.lastLoginAt;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={colors.accent.primary}
            colors={[colors.accent.primary]}
          />
        }
      >
        <View className="px-5 pt-6 pb-4">
          <Text className="text-neutral-900 dark:text-neutral-50 text-2xl font-bold tracking-tight">
            Profile
          </Text>
        </View>

        {/* Profile card */}
        <View className="mx-5 bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-5 gap-4">
          <View className="flex-row items-center gap-4">
            <Avatar name={displayName} uri={profile?.avatarUrl ?? undefined} size="xl" />
            <View className="flex-1 gap-2">
              <Text className="text-neutral-900 dark:text-neutral-50 text-lg font-semibold">
                {displayName}
              </Text>
              <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans" numberOfLines={1}>
                {displayEmail}
              </Text>
              <Badge label={roleLabel} variant={badgeVariant} size="sm" />
            </View>
          </View>
        </View>

        {/* Info rows */}
        {(status || lastLoginAt) && (
          <View className="mx-5 mt-4 bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 overflow-hidden">
            {status && (
              <>
                <View className="flex-row items-center gap-3 px-5 py-4">
                  <Ionicons name="checkmark-circle-outline" size={18} color={colors.icon.muted} />
                  <View className="flex-1">
                    <Text className="text-neutral-400 dark:text-dark-500 text-xs font-sans">Status</Text>
                    <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-sans mt-0.5">
                      {status}
                    </Text>
                  </View>
                </View>
                {lastLoginAt && <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-5" />}
              </>
            )}
            {lastLoginAt && (
              <View className="flex-row items-center gap-3 px-5 py-4">
                <Ionicons name="time-outline" size={18} color={colors.icon.muted} />
                <View className="flex-1">
                  <Text className="text-neutral-400 dark:text-dark-500 text-xs font-sans">Last login</Text>
                  <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-sans mt-0.5">
                    {formatDateTime(lastLoginAt)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Settings */}
        <View className="mx-5 mt-4 bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 overflow-hidden">
          <SettingsRow
            icon={isDark ? 'moon' : 'sunny-outline'}
            label={isDark ? 'Dark Mode' : 'Light Mode'}
            value={isDark ? 'On' : 'Off'}
            onPress={toggleTheme}
          />
          <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-5" />
          <SettingsRow
            icon="key-outline"
            label="Change Password"
            onPress={() => setChangePasswordVisible(true)}
          />
        </View>

        {/* Logout */}
        <View className="mx-5 mt-4 bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 overflow-hidden">
          <SettingsRow
            icon="log-out-outline"
            label={isLoggingOut ? 'Signing out…' : 'Sign Out'}
            onPress={() => logout()}
            dangerous
            loading={isLoggingOut}
            showChevron={false}
          />
        </View>

        <Text className="text-center text-neutral-300 dark:text-dark-300 text-xs font-sans mt-8">
          {footerLabel}
        </Text>
      </ScrollView>

      <ChangePasswordSheet
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
      />
    </SafeAreaView>
  );
}
