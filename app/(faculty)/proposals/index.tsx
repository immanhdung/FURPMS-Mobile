import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useMyProposals } from '@/features/faculty/hooks/useProposals';
import { ProposalCard } from '@/features/faculty/components/ProposalCard';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { PROPOSAL_STATUS } from '@/constants/statuses';

type FilterTab = 'ALL' | (typeof PROPOSAL_STATUS)[keyof typeof PROPOSAL_STATUS];

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: PROPOSAL_STATUS.DRAFT, label: 'Draft' },
  { key: PROPOSAL_STATUS.SUBMITTED, label: 'Submitted' },
  { key: PROPOSAL_STATUS.UNDER_REVIEW, label: 'Under Review' },
  { key: PROPOSAL_STATUS.APPROVED, label: 'Approved' },
  { key: PROPOSAL_STATUS.REJECTED, label: 'Rejected' },
  { key: PROPOSAL_STATUS.WITHDRAWN, label: 'Withdrawn' },
];

export default function ProposalsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, refetch, isFetching } = useMyProposals();

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return (data ?? []).filter((p) => {
      if (activeFilter !== 'ALL' && p.status !== activeFilter) return false;
      if (!query) return true;
      const haystack = `${p.titleVI ?? ''} ${p.titleEN ?? ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [data, activeFilter, debouncedSearch]);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      {/* Header */}
      <View className="px-5 pt-6 pb-4 flex-row items-center justify-between">
        <View className="gap-0.5">
          <Text className="text-neutral-900 dark:text-neutral-50 text-2xl font-bold tracking-tight">
            My Proposals
          </Text>
          {data && (
            <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
              {data.length} {data.length === 1 ? 'proposal' : 'proposals'}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(faculty)/proposals/create')}
          activeOpacity={0.7}
          className="bg-violet-500 dark:bg-violet-600 w-9 h-9 rounded-xl items-center justify-center"
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-5 mb-3">
        <View className="flex-row items-center gap-3 bg-white dark:bg-dark-50 rounded-xl border border-neutral-100 dark:border-dark-200 px-3 h-11">
          <Ionicons name="search-outline" size={18} color={colors.icon.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search proposals…"
            placeholderTextColor={colors.text.tertiary}
            className="flex-1 text-neutral-900 dark:text-neutral-50 text-sm font-sans"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={16} color={colors.icon.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        className="mb-3 flex-grow-0"
      >
        {FILTERS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveFilter(key)}
            activeOpacity={0.7}
            className={`px-3.5 py-2 rounded-full border ${
              activeFilter === key
                ? 'bg-violet-500 dark:bg-violet-600 border-violet-500 dark:border-violet-600'
                : 'bg-white dark:bg-dark-50 border-neutral-200 dark:border-dark-200'
            }`}
          >
            <Text className={`text-sm font-medium ${activeFilter === key ? 'text-white' : 'text-neutral-600 dark:text-dark-500'}`}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {isLoading ? (
        <LoadingState message="Loading proposals…" />
      ) : isError ? (
        <ErrorState title="Could not load proposals" message="Check your connection and try again." onRetry={refetch} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProposalCard proposal={item} onPress={() => router.push(`/(faculty)/proposals/${item.id}`)} />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 12, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={onRefresh} tintColor={colors.accent.primary} colors={[colors.accent.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              title={search ? 'No results found' : 'No proposals yet'}
              description={search ? `No proposals match "${search}"` : 'Start by creating your first research proposal.'}
              action={{ label: 'New Proposal', onPress: () => router.push('/(faculty)/proposals/create') }}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
