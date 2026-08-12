import { useMemo, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/shared/components/ui/Avatar';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { useFacultyDashboard } from '@/shared/hooks/useAnalytics';
import { useNotifications, useUnreadCount } from '@/features/notification/hooks/useNotifications';
import { useQueryClient } from '@tanstack/react-query';
import { formatRelative } from '@/utils/date';

const KPI_COLORS = [
  { bg: 'bg-violet-100 dark:bg-dark-100', text: 'text-violet-700 dark:text-violet-300' },
  { bg: 'bg-emerald-100 dark:bg-dark-100', text: 'text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-amber-100 dark:bg-dark-100', text: 'text-amber-700 dark:text-amber-300' },
  { bg: 'bg-blue-100 dark:bg-dark-100', text: 'text-blue-700 dark:text-blue-300' },
];

export default function FacultyDashboard() {
  const { t } = useTranslation('faculty');
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading: dashboardLoading } = useFacultyDashboard();
  const { data: notifications } = useNotifications();
  useUnreadCount();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greetingMorning');
    if (hour < 18) return t('dashboard.greetingAfternoon');
    return t('dashboard.greetingEvening');
  }, [t]);

  const recentNotifications = notifications?.filter((n) => !n.read).slice(0, 3) ?? [];

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  const maxStatusCount = Math.max(1, ...(dashboard?.proposalStatus ?? []).map((s) => s.count));

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent.primary} colors={[colors.accent.primary]} />
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
          <TouchableOpacity onPress={() => router.push('/(faculty)/profile')} activeOpacity={0.7}>
            <Avatar name={user?.fullName ?? ''} size="md" />
          </TouchableOpacity>
        </View>

        {/* KPIs */}
        <View className="px-5 gap-3">
          <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">{t('dashboard.researchOverview')}</Text>
          {dashboardLoading ? (
            <LoadingState message={t('dashboard.loadingOverview')} />
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {(dashboard?.kpis ?? []).map((kpi, i) => {
                const color = KPI_COLORS[i % KPI_COLORS.length];
                return (
                  <View key={kpi.id} className={`flex-1 min-w-[45%] ${color.bg} rounded-2xl p-4 gap-1 min-h-[72px]`}>
                    <Text className={`${color.text} text-2xl font-bold`}>{kpi.value}</Text>
                    <Text className="text-neutral-600 dark:text-dark-500 text-xs font-sans">{kpi.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-5 mt-5 gap-3">
          <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">{t('dashboard.quickActions')}</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(faculty)/proposals/create')}
              activeOpacity={0.7}
              className="flex-1 bg-violet-500 dark:bg-violet-600 rounded-2xl p-4 flex-row items-center gap-3"
            >
              <View className="bg-white/20 rounded-xl p-2">
                <Ionicons name="add" size={20} color="#fff" />
              </View>
              <Text className="text-white font-semibold text-sm">{t('dashboard.newProposal')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(faculty)/reports')} activeOpacity={0.7} className="flex-1">
              <GlassSurface rounded={24} className="p-4 flex-row items-center gap-3">
                <View className="bg-neutral-100 dark:bg-dark-200 rounded-xl p-2">
                  <Ionicons name="bar-chart-outline" size={20} color={colors.icon.default} />
                </View>
                <Text className="text-neutral-900 dark:text-neutral-50 font-semibold text-sm">{t('dashboard.reports')}</Text>
              </GlassSurface>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => router.push('/(faculty)/projects')} activeOpacity={0.7}>
            <GlassSurface rounded={24} className="p-4 flex-row items-center gap-3">
              <View className="bg-violet-100 dark:bg-violet-900/30 rounded-xl p-2">
                <Ionicons name="briefcase-outline" size={20} color={colors.accent.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-neutral-900 dark:text-neutral-50 font-semibold text-sm">Quản lý đề tài</Text>
                <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mt-0.5">Sản phẩm, điều chỉnh hợp đồng, tiến trình và lịch họp</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.icon.muted} />
            </GlassSurface>
          </TouchableOpacity>
        </View>

        {/* Proposal status breakdown */}
        {dashboard && dashboard.proposalStatus.length > 0 && (
          <View className="px-5 mt-6 gap-3">
            <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">{t('dashboard.proposalStatus')}</Text>
            <GlassSurface rounded={24} className="p-4 gap-3">
              {dashboard.proposalStatus.map((s) => (
                <View key={s.status} className="gap-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-neutral-700 dark:text-neutral-200 text-xs font-medium">{s.status}</Text>
                    <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{s.count}</Text>
                  </View>
                  <View className="h-2 rounded-full bg-neutral-100 dark:bg-dark-200 overflow-hidden">
                    <View
                      className="h-full bg-violet-500 dark:bg-violet-400 rounded-full"
                      style={{ width: `${Math.max(4, (s.count / maxStatusCount) * 100)}%` }}
                    />
                  </View>
                </View>
              ))}
            </GlassSurface>
          </View>
        )}

        {/* Upcoming deadlines */}
        {dashboard && dashboard.upcomingDeadlines.length > 0 && (
          <View className="px-5 mt-6 gap-3">
            <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">{t('dashboard.upcomingDeadlines')}</Text>
            <GlassSurface rounded={24}>
              {dashboard.upcomingDeadlines.map((d, i) => (
                <View key={`${d.label}-${i}`}>
                  {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-4" />}
                  <View className="flex-row items-center justify-between px-4 py-3">
                    <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">{d.label}</Text>
                    <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{d.count}</Text>
                  </View>
                </View>
              ))}
            </GlassSurface>
          </View>
        )}

        {/* AI suggestions */}
        {dashboard && dashboard.aiSuggestions.length > 0 && (
          <View className="px-5 mt-6 gap-3">
            <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">{t('dashboard.aiSuggestions')}</Text>
            <View className="bg-violet-50 dark:bg-violet-900/10 rounded-2xl border border-violet-100 dark:border-violet-900/30 p-4 gap-2">
              {dashboard.aiSuggestions.map((s, i) => (
                <View key={i} className="flex-row items-start gap-2">
                  <Ionicons name="sparkles-outline" size={14} color={colors.accent.primary} style={{ marginTop: 2 }} />
                  <Text className="flex-1 text-neutral-700 dark:text-neutral-200 text-sm font-sans leading-relaxed">{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Activity */}
        {dashboard && dashboard.activity.length > 0 && (
          <View className="px-5 mt-6 gap-3">
            <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">{t('dashboard.recentActivity')}</Text>
            <GlassSurface rounded={24}>
              {dashboard.activity.slice(0, 5).map((a, i) => (
                <View key={a.id}>
                  {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-4" />}
                  <View className="px-4 py-3">
                    <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-sans">{a.message}</Text>
                    <Text className="text-neutral-400 dark:text-dark-500 text-xs font-sans mt-0.5">{formatRelative(a.timestamp)}</Text>
                  </View>
                </View>
              ))}
            </GlassSurface>
          </View>
        )}

        {/* Recent Notifications */}
        {recentNotifications.length > 0 && (
          <View className="px-5 mt-6 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">{t('dashboard.unread')}</Text>
              <TouchableOpacity onPress={() => router.push('/(faculty)/notifications')} activeOpacity={0.7}>
                <Text className="text-violet-600 dark:text-violet-400 text-sm font-medium">{t('dashboard.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            <GlassSurface rounded={24}>
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
                        {n.message}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </GlassSurface>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
