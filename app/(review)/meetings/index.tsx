import { useCallback, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useMeetings } from '@/features/meeting/hooks/useMeetings';
import { MeetingCard } from '@/features/meeting/components/MeetingCard';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { isUpcoming } from '@/utils/date';

export default function ReviewMeetingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const { data, isLoading, isError, refetch, isFetching } = useMeetings();

  const sorted = useMemo(() => {
    return [...(data ?? [])].sort((a, b) => {
      const aUpcoming = isUpcoming(a.scheduledAt);
      const bUpcoming = isUpcoming(b.scheduledAt);
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
      const diff = new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      return aUpcoming ? diff : -diff;
    });
  }, [data]);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      <View className="px-5 pt-6 pb-4 gap-0.5">
        <Text className="text-neutral-900 dark:text-neutral-50 text-2xl font-bold tracking-tight">
          Meetings
        </Text>
        <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
          Council review meetings
        </Text>
      </View>

      {isLoading ? (
        <LoadingState message="Loading meetings…" />
      ) : isError ? (
        <ErrorState title="Could not load meetings" message="Check your connection and try again." onRetry={refetch} />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MeetingCard meeting={item} onPress={() => router.push(`/(review)/meetings/${item.id}`)} />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 12, flexGrow: 1 }}
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
            <EmptyState title="No meetings found" description="You have no council meetings scheduled." />
          }
        />
      )}
    </SafeAreaView>
  );
}
