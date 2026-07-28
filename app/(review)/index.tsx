import { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { useReviewerDashboard } from '@/shared/hooks/useAnalytics';
import { useMyMemberships, useRespondToInvitation } from '@/features/reviewCommittee/hooks/useMemberships';
import { useMeetings } from '@/features/meeting/hooks/useMeetings';
import { useUnreadCount } from '@/features/notification/hooks/useNotifications';
import { useQueryClient } from '@tanstack/react-query';
import { formatDateTime, formatRelative, isUpcoming } from '@/utils/date';
import { INVITATION_STATUS } from '@/constants/statuses';

const KPI_COLORS = [
  { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400' },
  { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400' },
  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400' },
  { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-400' },
];

export default function ReviewDashboard() {
  const { t } = useTranslation('reviewer');
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading: dashboardLoading, isFetching: dashboardFetching, refetch: refetchDashboard } = useReviewerDashboard();
  const { data: memberships } = useMyMemberships();
  const { mutate: respond, isPending: isResponding } = useRespondToInvitation();
  const { data: meetings } = useMeetings();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData ?? 0;

  const pendingInvitations = useMemo(
    () => (memberships ?? []).filter((m) => m.status === INVITATION_STATUS.PENDING).slice(0, 3),
    [memberships],
  );

  const nextMeeting = useMemo(
    () =>
      [...(meetings ?? [])]
        .filter((m) => isUpcoming(m.scheduledAt))
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0],
    [meetings],
  );

  const onRefresh = useCallback(async () => {
    await Promise.all([refetchDashboard(), queryClient.invalidateQueries()]);
  }, [refetchDashboard, queryClient]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t('dashboard.greetingMorning') : hour < 18 ? t('dashboard.greetingAfternoon') : t('dashboard.greetingEvening');

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={dashboardFetching} onRefresh={onRefresh} tintColor={colors.accent.primary} colors={[colors.accent.primary]} />
        }
      >
        {/* Header */}
        <View className="px-5 pt-6 pb-5 flex-row items-center justify-between">
          <View className="gap-0.5">
            <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">{greeting}</Text>
            <Text className="text-neutral-900 dark:text-neutral-50 text-xl font-bold tracking-tight">
              {user?.fullName ?? t('dashboard.defaultName')}
            </Text>
          </View>
          <View className="items-end gap-2">
            {user && <Avatar name={user.fullName} size="md" />}
            <Badge label={t('dashboard.roleBadge')} variant="info" size="sm" />
          </View>
        </View>

        {/* KPIs */}
        <View className="px-5 gap-3">
          <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">{t('dashboard.overview')}</Text>
          {dashboardLoading ? (
            <LoadingState message={t('dashboard.loadingOverview')} />
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {(dashboard?.kpis ?? []).map((kpi, i) => {
                const color = KPI_COLORS[i % KPI_COLORS.length];
                return (
                  <View key={kpi.id} className={`flex-1 min-w-[45%] ${color.bg} rounded-2xl p-4 gap-1`}>
                    <Text className={`${color.text} text-2xl font-bold`}>{kpi.value}</Text>
                    <Text className="text-neutral-600 dark:text-dark-400 text-xs font-sans">{kpi.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Pending invitations */}
        {pendingInvitations.length > 0 && (
          <View className="px-5 mt-6 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">{t('dashboard.pendingInvitations')}</Text>
              <TouchableOpacity onPress={() => router.push('/(review)/queue')} activeOpacity={0.7}>
                <Text className="text-violet-600 dark:text-violet-400 text-sm font-medium">{t('dashboard.viewAll')}</Text>
              </TouchableOpacity>
            </View>
            {pendingInvitations.map((m) => (
              <View key={m.memberId} className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-3">
                <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold" numberOfLines={2}>
                  {m.proposalTitleVI || t('dashboard.untitledProposal')}
                </Text>
                <View className="flex-row gap-2">
                  <Button label={t('dashboard.accept')} size="sm" onPress={() => respond({ memberId: m.memberId, payload: { accept: true } })} loading={isResponding} />
                  <Button label={t('dashboard.decline')} size="sm" variant="secondary" onPress={() => router.push('/(review)/queue')} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Review completion trend (no chart lib — simple bars) */}
        {dashboard && dashboard.reviewCompletionTrend.length > 0 && (
          <View className="px-5 mt-6 gap-3">
            <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">{t('dashboard.reviewProgress')}</Text>
            <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-3">
              {dashboard.reviewCompletionTrend.map((pt) => {
                const total = pt.completed + pt.pending || 1;
                return (
                  <View key={pt.label} className="gap-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-neutral-700 dark:text-neutral-200 text-xs font-medium">{pt.label}</Text>
                      <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                        {pt.completed}/{pt.completed + pt.pending}
                      </Text>
                    </View>
                    <View className="h-2 rounded-full bg-neutral-100 dark:bg-dark-200 overflow-hidden flex-row">
                      <View className="h-full bg-emerald-500" style={{ width: `${(pt.completed / total) * 100}%` }} />
                      <View className="h-full bg-amber-400" style={{ width: `${(pt.pending / total) * 100}%` }} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Next meeting */}
        {nextMeeting && (
          <View className="px-5 mt-6 gap-3">
            <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">{t('dashboard.nextMeeting')}</Text>
            <TouchableOpacity
              onPress={() => router.push(`/(review)/meetings/${nextMeeting.id}`)}
              activeOpacity={0.7}
              className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-2"
            >
              <Text className="text-neutral-900 dark:text-neutral-50 text-base font-semibold" numberOfLines={1}>
                {nextMeeting.title || t('dashboard.councilMeeting')}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="calendar-outline" size={13} color={colors.icon.muted} />
                <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">{formatDateTime(nextMeeting.scheduledAt)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Activity */}
        {dashboard && dashboard.activity.length > 0 && (
          <View className="px-5 mt-6 gap-3">
            <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">{t('dashboard.recentActivity')}</Text>
            <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 overflow-hidden">
              {dashboard.activity.slice(0, 5).map((a, i) => (
                <View key={a.id}>
                  {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-4" />}
                  <View className="px-4 py-3">
                    <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-sans">{a.message}</Text>
                    <Text className="text-neutral-400 dark:text-dark-500 text-xs font-sans mt-0.5">{formatRelative(a.timestamp)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick actions */}
        <View className="px-5 mt-6 gap-3">
          <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">{t('dashboard.quickActions')}</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(review)/queue')}
              activeOpacity={0.7}
              className="flex-1 bg-violet-500 dark:bg-violet-600 rounded-xl p-4 gap-2"
            >
              <Ionicons name="clipboard" size={22} color="#fff" />
              <Text className="text-white text-sm font-semibold">{t('dashboard.myReviews')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(review)/notifications')}
              activeOpacity={0.7}
              className="flex-1 bg-white dark:bg-dark-50 border border-neutral-100 dark:border-dark-200 rounded-xl p-4 gap-2"
            >
              <View className="relative self-start">
                <Ionicons name="notifications-outline" size={22} color={colors.icon.default} />
                {unreadCount > 0 && (
                  <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                    <Text className="text-white text-xs font-bold" style={{ lineHeight: 14 }}>
                      {unreadCount > 9 ? '9+' : String(unreadCount)}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">{t('dashboard.inbox')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
