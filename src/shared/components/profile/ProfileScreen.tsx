import { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge, type BadgeVariant } from '@/shared/components/ui/Badge';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { ListRow } from '@/shared/components/ui/ListRow';
import { formatDateTime } from '@/utils/date';
import { ChangePasswordSheet } from './ChangePasswordSheet';
import { LanguageSheet } from './LanguageSheet';
import { ROLES } from '@/constants/roles';

interface ProfileScreenProps {
  roleLabel: string;
  badgeVariant: BadgeVariant;
  footerLabel: string;
}

export function ProfileScreen({ roleLabel, badgeVariant, footerLabel }: ProfileScreenProps) {
  const { t } = useTranslation('profile');
  const { user, activeRole, setActiveRole } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { language } = useLocale();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: profile, refetch, isFetching } = useProfile();
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [languageVisible, setLanguageVisible] = useState(false);

  if (!user) return null;

  const roles = user.roles ?? [];
  const hasFaculty = roles.includes(ROLES.FACULTY);
  const hasReviewer = roles.includes(ROLES.REVIEW_COMMITTEE);
  const canSwitchRole = hasFaculty && hasReviewer;

  async function handleSwitchRole() {
    const nextRole = activeRole === ROLES.FACULTY ? ROLES.REVIEW_COMMITTEE : ROLES.FACULTY;
    await setActiveRole(nextRole);
  }

  const displayName = profile?.fullName ?? user.fullName;
  const displayEmail = profile?.email ?? user.email;
  const status = profile?.status ?? user.status;
  const lastLoginAt = profile?.lastLoginAt ?? user.lastLoginAt;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      <LinearGradient
        colors={
          isDark
            ? ['rgba(35,88,214,0.28)', 'rgba(35,88,214,0)']
            : ['rgba(35,88,214,0.16)', 'rgba(35,88,214,0)']
        }
        style={[StyleSheet.absoluteFillObject, { height: 260 }]}
        pointerEvents="none"
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
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
            {t('title')}
          </Text>
        </View>

        {/* Profile card */}
        <View className="mx-5">
          <GlassSurface rounded={20} className="p-5 gap-4">
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
          </GlassSurface>
        </View>

        {/* Info rows */}
        {(status || lastLoginAt) && (
          <View className="mx-5 mt-4">
            <GlassSurface rounded={20}>
              {status && (
                <>
                  <View className="flex-row items-center gap-3 px-5 py-4">
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.icon.muted} />
                    <View className="flex-1">
                      <Text className="text-neutral-400 dark:text-dark-500 text-xs font-sans">{t('status')}</Text>
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
                    <Text className="text-neutral-400 dark:text-dark-500 text-xs font-sans">{t('lastLogin')}</Text>
                    <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-sans mt-0.5">
                      {formatDateTime(lastLoginAt)}
                    </Text>
                  </View>
                </View>
              )}
            </GlassSurface>
          </View>
        )}

        {/* Settings */}
        <View className="mx-5 mt-4 gap-3">
          {canSwitchRole && (
            <ListRow
              icon="swap-horizontal-outline"
              label={t('switchRole')}
              value={activeRole === ROLES.FACULTY ? t('roleReviewCommittee') : t('roleFaculty')}
              onPress={handleSwitchRole}
            />
          )}
          <ListRow
            icon={isDark ? 'moon' : 'sunny-outline'}
            label={isDark ? t('darkMode') : t('lightMode')}
            value={isDark ? t('on') : t('off')}
            onPress={toggleTheme}
          />
          <ListRow
            icon="language-outline"
            label={t('language')}
            value={language === 'vi' ? t('languageSheet.vietnamese') : t('languageSheet.english')}
            onPress={() => setLanguageVisible(true)}
          />
          <ListRow
            icon="key-outline"
            label={t('changePassword')}
            onPress={() => setChangePasswordVisible(true)}
          />
        </View>

        {/* Logout */}
        <View className="mx-5 mt-3">
          <ListRow
            icon="log-out-outline"
            label={isLoggingOut ? t('signingOut') : t('signOut')}
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
      <LanguageSheet visible={languageVisible} onClose={() => setLanguageVisible(false)} />
    </SafeAreaView>
  );
}
