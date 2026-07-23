import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useReviewQueue, useCompletedReviews } from '@/features/reviewCommittee/hooks/useReviews';
import { ReviewQueueCard } from '@/features/reviewCommittee/components/ReviewQueueCard';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import type { ReviewStatus } from '@/features/reviewCommittee/types/review.types';

type FilterTab = 'ALL' | ReviewStatus;

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
];

export default function ReviewQueueScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');

  const {
    data: queue,
    isLoading: loadingQueue,
    isError: errorQueue,
    refetch: refetchQueue,
    isFetching: fetchingQueue,
  } = useReviewQueue();

  const {
    data: completed,
    isLoading: loadingCompleted,
    refetch: refetchCompleted,
  } = useCompletedReviews();

  const allItems = [
    ...(queue ?? []),
    ...(activeFilter === 'ALL' || activeFilter === 'COMPLETED' ? (completed ?? []) : []),
  ];

  const filtered =
    activeFilter === 'ALL'
      ? allItems
      : allItems.filter((r) => r.status === activeFilter);

  const isLoading = loadingQueue || (activeFilter === 'COMPLETED' && loadingCompleted);

  const onRefresh = useCallback(async () => {
    await Promise.all([refetchQueue(), refetchCompleted()]);
  }, [refetchQueue, refetchCompleted]);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      {/* Header */}
      <View className="px-5 pt-6 pb-4 gap-0.5">
        <Text className="text-neutral-900 dark:text-neutral-50 text-2xl font-bold tracking-tight">
          Review Queue
        </Text>
        {filtered.length > 0 && (
          <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
            {filtered.length} submission{filtered.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Filter tabs */}
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
        <LoadingState message="Loading review queue…" />
      ) : errorQueue ? (
        <ErrorState
          title="Could not load queue"
          message="Check your connection and try again."
          onRetry={refetchQueue}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReviewQueueCard
              review={item}
              onPress={() => router.push(`/(review)/queue/${item.id}`)}
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
              refreshing={fetchingQueue && !isLoading}
              onRefresh={onRefresh}
              tintColor={colors.accent.primary}
              colors={[colors.accent.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No submissions found"
              description={
                activeFilter !== 'ALL'
                  ? `No ${activeFilter.toLowerCase().replace('_', ' ')} submissions.`
                  : 'Your review queue is empty.'
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
