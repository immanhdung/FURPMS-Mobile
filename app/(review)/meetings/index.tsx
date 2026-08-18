import { useCallback, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useMeetings } from '@/features/meeting/hooks/useMeetings';
import { useMyMemberships } from '@/features/reviewCommittee/hooks/useMemberships';
import { isAcceptedInvitation } from '@/constants/statuses';
import { MeetingCard } from '@/features/meeting/components/MeetingCard';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { isUpcoming } from '@/utils/date';

export default function ReviewMeetingsScreen() {
  const { t } = useTranslation('reviewer');
  const router = useRouter();
  const { colors } = useTheme();

  const { data: meetings, isLoading: meetingsLoading, isError: meetingsError, refetch: refetchMeetings, isFetching: meetingsFetching } = useMeetings();
  const { data: memberships, isLoading: membershipsLoading, refetch: refetchMemberships } = useMyMemberships();

  const isLoading = meetingsLoading || membershipsLoading;
  const isError = meetingsError;

  useFocusEffect(
    useCallback(() => {
      refetchMeetings();
      refetchMemberships();
    }, [refetchMeetings, refetchMemberships])
  );

  const acceptedCouncilIds = useMemo(() => {
    return new Set(
      (memberships ?? [])
        .filter((m) => isAcceptedInvitation(m.status))
        .map((m) => m.councilId)
    );
  }, [memberships]);

  const sorted = useMemo(() => {
    const filteredMeetings = (meetings ?? []).filter((m) => acceptedCouncilIds.has(m.councilId));
    return [...filteredMeetings].sort((a, b) => {
      const aUpcoming = isUpcoming(a.scheduledAt);
      const bUpcoming = isUpcoming(b.scheduledAt);
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
      const diff = new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      return aUpcoming ? diff : -diff;
    });
  }, [meetings, acceptedCouncilIds]);

  const onRefresh = useCallback(async () => {
    await Promise.all([refetchMeetings(), refetchMemberships()]);
  }, [refetchMeetings, refetchMemberships]);

  const isFetching = meetingsFetching;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      <View className="px-5 pt-6 pb-4 gap-0.5">
        <Text className="text-neutral-900 dark:text-neutral-50 text-2xl font-bold tracking-tight">
          {t('meetings.title')}
        </Text>
        <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
          {t('meetings.subtitle')}
        </Text>
      </View>

      {isLoading ? (
        <LoadingState message={t('meetings.loading')} />
      ) : isError ? (
        <ErrorState title={t('meetings.errorTitle')} message={t('meetings.errorMessage')} onRetry={onRefresh} />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MeetingCard meeting={item} onPress={() => router.push(`/(review)/meetings/${item.id}`)} />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110, gap: 12, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={onRefresh}
              tintColor={colors.accent.primary}
              colors={[colors.accent.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState title={t('meetings.emptyTitle')} description={t('meetings.emptyDescription')} />
          }
        />
      )}
    </SafeAreaView>
  );
}
