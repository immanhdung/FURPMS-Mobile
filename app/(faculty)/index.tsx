import { useMemo, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { useProposalStats } from '@/features/faculty/hooks/useProposals';
import { useMeetings } from '@/features/meeting/hooks/useMeetings';
import { useNotifications, useUnreadCount } from '@/features/notification/hooks/useNotifications';
import { formatDateTime } from '@/utils/date';
import { useQueryClient } from '@tanstack/react-query';

interface StatCardProps {
  value: number | string;
  label: string;
  bg: string;
  textColor: string;
}

function StatCard({ value, label, bg, textColor }: StatCardProps) {
  return (
    <View className={`flex-1 ${bg} rounded-2xl p-4 gap-1 min-h-[72px]`}>
      <Text className={`${textColor} text-2xl font-bold`}>{value}</Text>
      <Text className="text-neutral-600 dark:text-dark-500 text-xs font-sans">{label}</Text>
    </View>
  );
}

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useProposalStats();
  const { data: meetings } = useMeetings({ upcoming: true });
  const { data: notifications } = useNotifications();
  useUnreadCount();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const nextMeeting = meetings?.[0];
  const recentNotifications = notifications?.filter((n) => !n.isRead).slice(0, 3) ?? [];

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
            colors={[colors.accent.primary]}
          />
        }
      >
        {/* Header */}
        <View className="px-5 pt-6 pb-5 flex-row items-center justify-between">
          <View className="gap-0.5">
            <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
              {greeting}
            </Text>
            <Text className="text-neutral-900 dark:text-neutral-50 text-xl font-bold tracking-tight">
              {user?.name ?? 'Faculty'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(faculty)/profile/index')} activeOpacity={0.7}>
            <Avatar name={user?.name ?? ''} size="md" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="px-5 gap-3">
          <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">
            Research Overview
          </Text>
          {statsLoading ? (
            <LoadingState message="Loading stats…" />
          ) : (
            <>
              <View className="flex-row gap-3">
                <StatCard
                  value={stats?.total ?? 0}
                  label="Total"
                  bg="bg-violet-100 dark:bg-dark-100"
                  textColor="text-violet-700 dark:text-violet-300"
                />
                <StatCard
                  value={stats?.approved ?? 0}
                  label="Approved"
                  bg="bg-emerald-100 dark:bg-dark-100"
                  textColor="text-emerald-700 dark:text-emerald-300"
                />
              </View>
              <View className="flex-row gap-3">
                <StatCard
                  value={stats?.underReview ?? 0}
                  label="Under Review"
                  bg="bg-amber-100 dark:bg-dark-100"
                  textColor="text-amber-700 dark:text-amber-300"
                />
                <StatCard
                  value={stats?.draft ?? 0}
                  label="Draft"
                  bg="bg-neutral-100 dark:bg-dark-100"
                  textColor="text-neutral-700 dark:text-neutral-300"
                />
              </View>
            </>
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-5 mt-5 gap-3">
          <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(faculty)/proposals/create')}
              activeOpacity={0.7}
              className="flex-1 bg-violet-500 dark:bg-violet-600 rounded-2xl p-4 flex-row items-center gap-3"
            >
              <View className="bg-white/20 rounded-xl p-2">
                <Ionicons name="add" size={20} color="#fff" />
              </View>
              <Text className="text-white font-semibold text-sm">New Proposal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(faculty)/proposals')}
              activeOpacity={0.7}
              className="flex-1 bg-white dark:bg-dark-50 border border-neutral-100 dark:border-dark-200 rounded-2xl p-4 flex-row items-center gap-3"
            >
              <View className="bg-neutral-100 dark:bg-dark-200 rounded-xl p-2">
                <Ionicons name="document-text-outline" size={20} color={colors.icon.default} />
              </View>
              <Text className="text-neutral-900 dark:text-neutral-50 font-semibold text-sm">
                My Proposals
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Meeting */}
        {nextMeeting && (
          <View className="px-5 mt-5 gap-3">
            <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">
              Next Meeting
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/(faculty)/meetings/${nextMeeting.id}`)}
              activeOpacity={0.7}
              className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-2"
            >
              <View className="flex-row items-center justify-between">
                <Badge
                  label={nextMeeting.type === 'REVIEW' ? 'Review' : nextMeeting.type === 'DISCUSSION' ? 'Discussion' : 'General'}
                  variant={nextMeeting.type === 'REVIEW' ? 'purple' : 'info'}
                />
                <Text className="text-neutral-400 dark:text-dark-500 text-xs font-sans">
                  {formatDateTime(nextMeeting.scheduledAt)}
                </Text>
              </View>
              <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold" numberOfLines={2}>
                {nextMeeting.title}
              </Text>
              {nextMeeting.linkedProposalTitle && (
                <Text className="text-violet-600 dark:text-violet-400 text-xs font-medium" numberOfLines={1}>
                  {nextMeeting.linkedProposalTitle}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Notifications */}
        {recentNotifications.length > 0 && (
          <View className="px-5 mt-5 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">
                Unread
              </Text>
              <TouchableOpacity onPress={() => router.push('/(faculty)/notifications/index')} activeOpacity={0.7}>
                <Text className="text-violet-600 dark:text-violet-400 text-sm font-medium">See all</Text>
              </TouchableOpacity>
            </View>
            <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 overflow-hidden">
              {recentNotifications.map((n, i) => (
                <View key={n.id}>
                  {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-4" />}
                  <View className="px-4 py-3 flex-row items-start gap-3">
                    <View className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                    <View className="flex-1">
                      <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold" numberOfLines={1}>
                        {n.title}
                      </Text>
                      <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mt-0.5" numberOfLines={2}>
                        {n.body}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

