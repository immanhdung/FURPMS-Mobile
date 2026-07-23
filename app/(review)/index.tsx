import { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useReviewQueueStats, useReviewQueue } from '@/features/reviewCommittee/hooks/useReviews';
import { useMeetings } from '@/features/meeting/hooks/useMeetings';
import { useUnreadCount } from '@/features/notification/hooks/useNotifications';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { ReviewQueueCard } from '@/features/reviewCommittee/components/ReviewQueueCard';
import { formatDateTime, isUpcoming } from '@/utils/date';

function StatCard({
  value,
  label,
  bgClass,
  textClass,
}: {
  value: number | string;
  label: string;
  bgClass: string;
  textClass: string;
}) {
  return (
    <View className={`flex-1 ${bgClass} rounded-2xl p-4 gap-1`}>
      <Text className={`${textClass} text-2xl font-bold`}>{value}</Text>
      <Text className="text-neutral-600 dark:text-dark-400 text-xs font-sans">{label}</Text>
    </View>
  );
}

export default function ReviewDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();

  const { data: stats, refetch: refetchStats, isFetching: fetchingStats } = useReviewQueueStats();
  const { data: queue, refetch: refetchQueue } = useReviewQueue();
  const { data: meetings } = useMeetings();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData ?? 0;

  const highPriority = (queue ?? [])
    .filter((r) => r.status !== 'COMPLETED' && r.priority === 'HIGH')
    .slice(0, 3);

  const nextMeeting = [...(meetings ?? [])]
    .filter((m) => isUpcoming(m.scheduledAt))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  const onRefresh = useCallback(async () => {
    await Promise.all([refetchStats(), refetchQueue()]);
  }, [refetchStats, refetchQueue]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={fetchingStats}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
            colors={[colors.accent.primary]}
          />
        }
      >
        {/* Header */}
        <View className="px-5 pt-6 pb-5 flex-row items-center justify-between">
          <View className="gap-0.5">
            <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">{greeting}</Text>
            <Text className="text-neutral-900 dark:text-neutral-50 text-xl font-bold tracking-tight">
              {user?.fullName ?? 'Reviewer'}
            </Text>
          </View>
          <View className="items-end gap-2">
            {user && <Avatar name={user.fullName} size="md" />}
            <Badge label="Reviewer" variant="info" size="sm" />
          </View>
        </View>

        {/* Stats grid */}
        <View className="px-5 gap-3">
          <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">
            Queue Overview
          </Text>
          <View className="flex-row gap-3">
            <StatCard
              value={stats?.pending ?? '–'}
              label="Pending"
              bgClass="bg-amber-50 dark:bg-amber-900/20"
              textClass="text-amber-700 dark:text-amber-400"
            />
            <StatCard
              value={stats?.inProgress ?? '–'}
              label="In Progress"
              bgClass="bg-blue-50 dark:bg-blue-900/20"
              textClass="text-blue-700 dark:text-blue-400"
            />
            <StatCard
              value={stats?.completed ?? '–'}
              label="Completed"
              bgClass="bg-emerald-50 dark:bg-emerald-900/20"
              textClass="text-emerald-700 dark:text-emerald-400"
            />
          </View>
          {(stats?.overdue ?? 0) > 0 && (
            <View className="flex-row items-center gap-2 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">
              <Ionicons name="alert-circle" size={16} color={colors.accent.danger} />
              <Text className="text-red-700 dark:text-red-400 text-sm font-medium">
                {stats!.overdue} overdue review{stats!.overdue > 1 ? 's' : ''} — action required
              </Text>
            </View>
          )}
        </View>

        {/* High priority */}
        {highPriority.length > 0 && (
          <View className="px-5 mt-6 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">
                High Priority
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(review)/queue')}
                activeOpacity={0.7}
              >
                <Text className="text-violet-600 dark:text-violet-400 text-sm font-medium">
                  View all
                </Text>
              </TouchableOpacity>
            </View>
            {highPriority.map((review) => (
              <ReviewQueueCard
                key={review.id}
                review={review}
                onPress={() => router.push(`/(review)/queue/${review.id}`)}
              />
            ))}
          </View>
        )}

        {/* Next meeting */}
        {nextMeeting && (
          <View className="px-5 mt-6 gap-3">
            <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">
              Next Meeting
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/(review)/meetings/${nextMeeting.id}`)}
              activeOpacity={0.7}
              className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-2"
            >
              <Text
                className="text-neutral-900 dark:text-neutral-50 text-base font-semibold"
                numberOfLines={1}
              >
                {nextMeeting.title || 'Council meeting'}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="calendar-outline" size={13} color={colors.icon.muted} />
                <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
                  {formatDateTime(nextMeeting.scheduledAt)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick actions */}
        <View className="px-5 mt-6 gap-3">
          <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(review)/queue')}
              activeOpacity={0.7}
              className="flex-1 bg-violet-500 dark:bg-violet-600 rounded-xl p-4 gap-2"
            >
              <Ionicons name="clipboard" size={22} color="#fff" />
              <Text className="text-white text-sm font-semibold">Review Queue</Text>
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
              <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">
                Inbox
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
