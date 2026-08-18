import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { useMyProposals } from '@/features/faculty/hooks/useProposals';
import { useMyContracts } from '@/features/faculty/hooks/useContracts';
import { resolveProposalStatus } from '@/utils/status';
import { ProposalCard } from '@/features/faculty/components/ProposalCard';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { PROPOSAL_STATUS } from '@/constants/statuses';

type FilterTab = 'ALL' | (typeof PROPOSAL_STATUS)[keyof typeof PROPOSAL_STATUS];

export default function ProposalsScreen() {
  const { t } = useTranslation('faculty');
  const router = useRouter();
  const { colors } = useTheme();

  const FILTERS: { key: FilterTab; label: string }[] = [
    { key: 'ALL', label: t('proposalsList.filters.all') },
    { key: PROPOSAL_STATUS.DRAFT, label: t('proposalsList.filters.draft') },
    { key: PROPOSAL_STATUS.SUBMITTED, label: t('proposalsList.filters.submitted') },
    { key: PROPOSAL_STATUS.UNDER_REVIEW, label: t('proposalsList.filters.underReview') },
    { key: PROPOSAL_STATUS.APPROVED, label: t('proposalsList.filters.approved') },
    { key: PROPOSAL_STATUS.IN_PROGRESS_REPORT, label: t('proposalsList.filters.inProgressReport') },
    { key: PROPOSAL_STATUS.IN_FINAL_REPORT, label: t('proposalsList.filters.inFinalReport') },
    { key: PROPOSAL_STATUS.IN_ACCEPTANCE, label: t('proposalsList.filters.inAcceptance') },
    { key: PROPOSAL_STATUS.ACCEPTANCE_PASSED, label: t('proposalsList.filters.acceptancePassed') },
    { key: PROPOSAL_STATUS.ACCEPTANCE_FAILED, label: t('proposalsList.filters.acceptanceFailed') },
    { key: PROPOSAL_STATUS.REJECTED, label: t('proposalsList.filters.rejected') },
    { key: PROPOSAL_STATUS.WITHDRAWN, label: t('proposalsList.filters.withdrawn') },
  ];

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, refetch, isFetching } = useMyProposals();
  const { data: contracts } = useMyContracts();

  const resolvedProposals = useMemo(() => {
    return (data ?? []).map((p) => ({
      ...p,
      status: resolveProposalStatus(p.status, contracts, p.id) ?? p.status,
    }));
  }, [data, contracts]);

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return resolvedProposals.filter((p) => {
      if (activeFilter !== 'ALL' && p.status !== activeFilter) return false;
      if (!query) return true;
      const haystack = `${p.titleVI ?? ''} ${p.titleEN ?? ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [resolvedProposals, activeFilter, debouncedSearch]);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      {/* Header */}
      <View className="px-5 pt-6 pb-4 flex-row items-center justify-between">
        <View className="gap-0.5">
          <Text className="text-neutral-900 dark:text-neutral-50 text-2xl font-bold tracking-tight">
            {t('proposalsList.title')}
          </Text>
          {data && (
            <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
              {t('proposalsList.count', { count: data.length })}
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
        <GlassSurface rounded={16} className="flex-row items-center gap-3 px-3 h-11">
          <Ionicons name="search-outline" size={18} color={colors.icon.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('proposalsList.searchPlaceholder')}
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
        </GlassSurface>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        className="mb-3 flex-grow-0"
      >
        {FILTERS.map(({ key, label }) =>
          activeFilter === key ? (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveFilter(key)}
              activeOpacity={0.7}
              className="px-3.5 py-2 rounded-full bg-violet-500 dark:bg-violet-600"
            >
              <Text className="text-sm font-medium text-white">{label}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity key={key} onPress={() => setActiveFilter(key)} activeOpacity={0.7}>
              <GlassSurface rounded={999} className="px-3.5 py-2">
                <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{label}</Text>
              </GlassSurface>
            </TouchableOpacity>
          ),
        )}
      </ScrollView>

      {/* List */}
      {isLoading ? (
        <LoadingState message={t('proposalsList.loading')} />
      ) : isError ? (
        <ErrorState title={t('proposalsList.errorTitle')} message={t('proposalsList.errorMessage')} onRetry={refetch} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProposalCard proposal={item} onPress={() => router.push(`/(faculty)/proposals/${item.id}`)} />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110, gap: 12, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={onRefresh} tintColor={colors.accent.primary} colors={[colors.accent.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              title={search ? t('proposalsList.noResultsTitle') : t('proposalsList.emptyTitle')}
              description={search ? t('proposalsList.noResultsDescription', { query: search }) : t('proposalsList.emptyDescription')}
              action={{ label: t('proposalsList.newProposal'), onPress: () => router.push('/(faculty)/proposals/create') }}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
