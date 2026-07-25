import { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useMeeting } from '@/features/meeting/hooks/useMeetings';
import { Badge } from '@/shared/components/ui/Badge';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { formatDateTime, formatDuration, isUpcoming } from '@/utils/date';

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 overflow-hidden">
      {children}
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-neutral-900 dark:text-neutral-50 text-base font-semibold mb-3">{title}</Text>
  );
}

export default function ReviewMeetingDetailScreen() {
  const { t } = useTranslation('reviewer');
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { data: meeting, isLoading, isError, refetch } = useMeeting(id);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (isLoading) return <LoadingState message={t('meetings.detail.loading')} />;
  if (isError || !meeting) {
    return <ErrorState title={t('meetings.detail.errorTitle')} message={t('meetings.detail.errorMessage')} onRetry={refetch} />;
  }

  const upcoming = isUpcoming(meeting.scheduledAt);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.accent.primary} colors={[colors.accent.primary]} />
        }
      >
        {/* Hero */}
        <View className="mb-5 gap-3">
          <View className="flex-row items-center gap-2 flex-wrap">
            {meeting.status && <Badge label={meeting.status} variant={upcoming ? 'info' : 'default'} size="md" />}
          </View>
          <Text className="text-neutral-900 dark:text-neutral-50 text-xl font-bold leading-snug">
            {meeting.title || t('meetings.detail.councilMeeting')}
          </Text>
        </View>

        {/* Details */}
        <View className="mb-5">
          <SectionHeader title={t('meetings.detail.detailsTitle')} />
          <SectionCard>
            <View className="p-4 gap-3">
              <View className="flex-row items-center gap-3">
                <View className="bg-violet-100 dark:bg-violet-900/30 w-9 h-9 rounded-xl items-center justify-center">
                  <Ionicons name="calendar" size={18} color={colors.accent.primary} />
                </View>
                <View>
                  <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{t('meetings.detail.dateTime')}</Text>
                  <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">
                    {formatDateTime(meeting.scheduledAt)}
                  </Text>
                </View>
              </View>

              <View className="h-px bg-neutral-100 dark:bg-dark-200" />

              <View className="flex-row items-center gap-3">
                <View className="bg-amber-100 dark:bg-amber-900/30 w-9 h-9 rounded-xl items-center justify-center">
                  <Ionicons name="hourglass" size={18} color={colors.accent.warning} />
                </View>
                <View>
                  <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{t('meetings.detail.duration')}</Text>
                  <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">
                    {formatDuration(meeting.durationMinutes)}
                  </Text>
                </View>
              </View>

              {meeting.meetingLink ? (
                <>
                  <View className="h-px bg-neutral-100 dark:bg-dark-200" />
                  <TouchableOpacity
                    className="flex-row items-center gap-3"
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(meeting.meetingLink!)}
                  >
                    <View className="bg-emerald-100 dark:bg-emerald-900/30 w-9 h-9 rounded-xl items-center justify-center">
                      <Ionicons name="videocam" size={18} color={colors.accent.success} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                        {meeting.platform || t('meetings.detail.videoLink')}
                      </Text>
                      <Text className="text-violet-600 dark:text-violet-400 text-sm font-medium">
                        {t('meetings.detail.joinOnline')}
                      </Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color={colors.icon.muted} />
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          </SectionCard>
        </View>

        {/* Agenda */}
        {meeting.agenda ? (
          <View className="mb-5">
            <SectionHeader title={t('meetings.detail.agenda')} />
            <SectionCard>
              <View className="p-4">
                <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-sans leading-relaxed">
                  {meeting.agenda}
                </Text>
              </View>
            </SectionCard>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
