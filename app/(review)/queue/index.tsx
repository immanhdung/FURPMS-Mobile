import { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { useMyMemberships, useRespondToInvitation } from '@/features/reviewCommittee/hooks/useMemberships';
import { MembershipCard } from '@/features/reviewCommittee/components/MembershipCard';
import { DeclineInvitationDialog } from '@/features/reviewCommittee/components/DeclineInvitationDialog';
import { Button } from '@/shared/components/ui/Button';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { INVITATION_STATUS, ROUND_STATUS, isAcceptedInvitation } from '@/constants/statuses';
import type { MyMembership } from '@/features/reviewCommittee/types/membership.types';

type FilterTab = 'INVITATIONS' | 'ASSIGNED' | 'SCORING' | 'ALL';

function filterMemberships(memberships: MyMembership[], tab: FilterTab): MyMembership[] {
  switch (tab) {
    case 'INVITATIONS':
      return memberships.filter((m) => m.status === INVITATION_STATUS.PENDING);
    case 'ASSIGNED':
      return memberships.filter((m) => isAcceptedInvitation(m.status));
    case 'SCORING':
      return memberships.filter((m) => isAcceptedInvitation(m.status) && m.roundStatus === ROUND_STATUS.OPEN);
    case 'ALL':
    default:
      return memberships;
  }
}

export default function ReviewQueueScreen() {
  const { t } = useTranslation('reviewer');
  const router = useRouter();
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('INVITATIONS');
  const [decliningId, setDecliningId] = useState<string | null>(null);

  const FILTERS: { key: FilterTab; label: string }[] = [
    { key: 'INVITATIONS', label: t('queue.filters.invitations') },
    { key: 'ASSIGNED', label: t('queue.filters.assigned') },
    { key: 'SCORING', label: t('queue.filters.scoring') },
    { key: 'ALL', label: t('queue.filters.all') },
  ];

  const { data, isLoading, isError, refetch, isFetching } = useMyMemberships();
  const { mutate: respond, isPending: isResponding } = useRespondToInvitation();

  const filtered = useMemo(() => filterMemberships(data ?? [], activeFilter), [data, activeFilter]);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  function handleAccept(memberId: string) {
    respond({ memberId, payload: { accept: true } });
  }

  function handleDeclineConfirm(reason?: string) {
    if (!decliningId) return;
    respond(
      { memberId: decliningId, payload: { accept: false, declineReason: reason } },
      { onSuccess: () => setDecliningId(null) },
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      <View className="px-5 pt-6 pb-4 gap-0.5">
        <Text className="text-neutral-900 dark:text-neutral-50 text-2xl font-bold tracking-tight">{t('queue.title')}</Text>
        {filtered.length > 0 && (
          <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
            {t('queue.itemCount', { count: filtered.length })}
          </Text>
        )}
      </View>

      <View className="mb-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(f) => f.key}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          renderItem={({ item: { key, label } }) =>
            activeFilter === key ? (
              <TouchableOpacity
                onPress={() => setActiveFilter(key)}
                activeOpacity={0.7}
                className="px-3.5 py-2 rounded-full bg-violet-500 dark:bg-violet-600"
              >
                <Text className="text-sm font-medium text-white">{label}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setActiveFilter(key)} activeOpacity={0.7}>
                <GlassSurface rounded={999} className="px-3.5 py-2">
                  <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{label}</Text>
                </GlassSurface>
              </TouchableOpacity>
            )
          }
        />
      </View>

      {isLoading ? (
        <LoadingState message={t('queue.loading')} />
      ) : isError ? (
        <ErrorState title={t('queue.errorTitle')} message={t('queue.errorMessage')} onRetry={refetch} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.memberId}
          renderItem={({ item }) => {
            const isInvitation = item.status === INVITATION_STATUS.PENDING;
            return (
              <MembershipCard
                membership={item}
                onPress={!isInvitation ? () => router.push(`/(review)/queue/${item.councilId}`) : undefined}
                actions={
                  isInvitation ? (
                    <>
                      <Button label={t('queue.accept')} size="sm" onPress={() => handleAccept(item.memberId)} loading={isResponding} />
                      <Button label={t('queue.decline')} size="sm" variant="secondary" onPress={() => setDecliningId(item.memberId)} />
                    </>
                  ) : undefined
                }
              />
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110, gap: 12, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={onRefresh} tintColor={colors.accent.primary} colors={[colors.accent.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              title={t('queue.emptyTitle')}
              description={
                activeFilter === 'INVITATIONS'
                  ? t('queue.emptyInvitations')
                  : activeFilter === 'SCORING'
                  ? t('queue.emptyScoring')
                  : t('queue.emptyDefault')
              }
            />
          }
        />
      )}

      <DeclineInvitationDialog
        visible={!!decliningId}
        isSubmitting={isResponding}
        onClose={() => setDecliningId(null)}
        onConfirm={handleDeclineConfirm}
      />
    </SafeAreaView>
  );
}
