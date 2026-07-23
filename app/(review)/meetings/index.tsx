import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useMeetings } from '@/features/meeting/hooks/useMeetings';
import { MeetingCard } from '@/features/meeting/components/MeetingCard';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import type { MeetingStatus } from '@/features/meeting/types/meeting.types';

type FilterTab = 'ALL' | MeetingStatus;

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export default function ReviewMeetingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');

  const filters = activeFilter === 'ALL' ? undefined : { status: activeFilter };
  const { data, isLoading, isError, refetch, isFetching } = useMeetings(filters as never);

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
          Scheduled and past meetings
        </Text>
      </View>

      <View className="mb-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(f) => f.key}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          renderItem={({ item: { key, label } }) => (
            <TouchableOpacity
              onPress={() => setActiveFilter(key)}
              activeOpacity={0.7}
              className={`px-3.5 py-2 rounded-full border ${
                activeFilter === key
                  ? 'bg-violet-500 dark:bg-violet-600 border-violet-500 dark:border-violet-600'
                  : 'bg-white dark:bg-dark-50 border-neutral-200 dark:border-dark-200'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  activeFilter === key
                    ? 'text-white'
                    : 'text-neutral-600 dark:text-dark-500'
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <LoadingState message="Loading meetings…" />
      ) : isError ? (
        <ErrorState
          title="Could not load meetings"
          message="Check your connection and try again."
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MeetingCard
              meeting={item}
              onPress={() => router.push(`/(review)/meetings/${item.id}`)}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 32,
            gap: 12,
            flexGrow: 1,
          }}
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
            <EmptyState
              title="No meetings found"
              description={
                activeFilter !== 'ALL'
                  ? `No ${activeFilter.toLowerCase()} meetings.`
                  : 'You have no scheduled meetings.'
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
