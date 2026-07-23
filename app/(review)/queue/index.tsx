import { useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
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

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'INVITATIONS', label: 'Invitations' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'SCORING', label: 'Scoring Open' },
  { key: 'ALL', label: 'All' },
];

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
  const router = useRouter();
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('INVITATIONS');
  const [decliningId, setDecliningId] = useState<string | null>(null);

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
        <Text className="text-neutral-900 dark:text-neutral-50 text-2xl font-bold tracking-tight">My Reviews</Text>
        {filtered.length > 0 && (
          <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
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
              <Text className={`text-sm font-medium ${activeFilter === key ? 'text-white' : 'text-neutral-600 dark:text-dark-500'}`}>
                {label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <LoadingState message="Loading your reviews…" />
      ) : isError ? (
        <ErrorState title="Could not load reviews" message="Check your connection and try again." onRetry={refetch} />
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
                      <Button label="Accept" size="sm" onPress={() => handleAccept(item.memberId)} loading={isResponding} />
                      <Button label="Decline" size="sm" variant="secondary" onPress={() => setDecliningId(item.memberId)} />
                    </>
                  ) : undefined
                }
              />
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 12, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={onRefresh} tintColor={colors.accent.primary} colors={[colors.accent.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              title="Nothing here"
              description={
                activeFilter === 'INVITATIONS'
                  ? 'No pending invitations right now.'
                  : activeFilter === 'SCORING'
                  ? 'No councils currently open for scoring.'
                  : 'No reviews found.'
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
