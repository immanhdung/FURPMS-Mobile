import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useProposal, useSubmitProposal, useWithdrawProposal } from '@/features/faculty/hooks/useProposals';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { Avatar } from '@/shared/components/ui/Avatar';
import { ProposalStatusTimeline } from '@/features/faculty/components/ProposalStatusTimeline';
import { ProposalDocumentsCard } from '@/features/faculty/components/ProposalDocumentsCard';
import { ExpectedProductsCard } from '@/features/faculty/components/ExpectedProductsCard';
import { SubmitProposalSheet } from '@/features/faculty/components/SubmitProposalSheet';
import { formatDate } from '@/utils/date';
import { getStatusLabel } from '@/utils/status';
import { PROPOSAL_STATUS } from '@/constants/statuses';
import type { BadgeVariant } from '@/shared/components/ui/Badge';

const statusVariant: Record<string, BadgeVariant> = {
  [PROPOSAL_STATUS.DRAFT]: 'default',
  [PROPOSAL_STATUS.SUBMITTED]: 'info',
  [PROPOSAL_STATUS.UNDER_REVIEW]: 'warning',
  [PROPOSAL_STATUS.APPROVED]: 'success',
  [PROPOSAL_STATUS.REJECTED]: 'danger',
  [PROPOSAL_STATUS.WITHDRAWN]: 'default',
};

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-neutral-900 dark:text-neutral-50 text-base font-semibold mb-3">{title}</Text>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-3">
      {children}
    </View>
  );
}

function TextField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View className="gap-1">
      <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{label}</Text>
      <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-sans leading-relaxed">{value}</Text>
    </View>
  );
}

export default function ProposalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const { data: proposal, isLoading, isError, refetch } = useProposal(id);
  const { mutate: submitProposal, isPending: isSubmitting } = useSubmitProposal(id);
  const { mutate: withdrawProposal, isPending: isWithdrawing } = useWithdrawProposal(id);
  const [submitSheetVisible, setSubmitSheetVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (isLoading) return <LoadingState message="Loading proposal…" />;
  if (isError || !proposal) {
    return <ErrorState title="Could not load proposal" message="Check your connection and try again." onRetry={refetch} />;
  }

  const isDraft = proposal.status === PROPOSAL_STATUS.DRAFT;
  const canWithdraw = proposal.status === PROPOSAL_STATUS.SUBMITTED || proposal.status === PROPOSAL_STATUS.UNDER_REVIEW;
  const title = proposal.titleVI || proposal.titleEN || 'Untitled proposal';

  function handleWithdraw() {
    Alert.alert('Withdraw Proposal', 'Are you sure you want to withdraw this proposal? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Withdraw', style: 'destructive', onPress: () => withdrawProposal() },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.accent.primary} colors={[colors.accent.primary]} />
        }
      >
        {/* Hero */}
        <View className="px-5 pt-4 pb-5 gap-3">
          <Badge label={getStatusLabel(proposal.status)} variant={statusVariant[proposal.status ?? ''] ?? 'default'} size="md" />
          <Text className="text-neutral-900 dark:text-neutral-50 text-xl font-bold leading-snug">{title}</Text>
          {proposal.titleVI && proposal.titleEN && proposal.titleVI !== proposal.titleEN && (
            <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans italic">{proposal.titleEN}</Text>
          )}
          {proposal.createdAt && (
            <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">Created {formatDate(proposal.createdAt)}</Text>
          )}
          <ProposalStatusTimeline status={proposal.status} />
        </View>

        {/* Action buttons */}
        {(isDraft || canWithdraw) && (
          <View className="px-5 mb-5 flex-row gap-3">
            {isDraft && (
              <>
                <Button label="Submit" variant="primary" size="md" onPress={() => setSubmitSheetVisible(true)} />
                <Button
                  label="Edit"
                  variant="secondary"
                  size="md"
                  onPress={() => router.push(`/(faculty)/proposals/create?edit=${id}`)}
                />
              </>
            )}
            {canWithdraw && (
              <Button label="Withdraw" variant="danger" size="md" loading={isWithdrawing} onPress={handleWithdraw} />
            )}
          </View>
        )}

        <View className="px-5 gap-5">
          {/* Overview */}
          <View>
            <SectionHeader title="Overview" />
            <InfoCard>
              <TextField label="Abstract" value={proposal.abstractEN} />
              <View className="h-px bg-neutral-100 dark:bg-dark-200" />
              <TextField label="Objectives" value={proposal.objectives} />
              <TextField label="Methodology" value={proposal.methodology} />
              <TextField label="Expected Output" value={proposal.expectedOutput} />
              <View className="h-px bg-neutral-100 dark:bg-dark-200" />
              <View className="flex-row gap-6">
                <View className="flex-1">
                  <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">Duration</Text>
                  <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium mt-0.5">
                    {proposal.durationMonths} months
                  </Text>
                </View>
                {proposal.fundingMethod && (
                  <View className="flex-1">
                    <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">Funding</Text>
                    <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium mt-0.5">
                      {proposal.fundingMethod === 'PARTIAL' ? 'Partial' : 'Whole'}
                    </Text>
                  </View>
                )}
              </View>
            </InfoCard>
          </View>

          {/* Additional details */}
          {(proposal.urgency || proposal.novelty || proposal.applicationPotential || proposal.transferPotential || proposal.facilities) && (
            <View>
              <SectionHeader title="Research Assessment" />
              <InfoCard>
                <TextField label="Urgency" value={proposal.urgency} />
                <TextField label="Novelty" value={proposal.novelty} />
                <TextField label="Application Potential" value={proposal.applicationPotential} />
                <TextField label="Transfer Potential" value={proposal.transferPotential} />
                <TextField label="Facilities" value={proposal.facilities} />
              </InfoCard>
            </View>
          )}

          {/* Team */}
          {proposal.members && proposal.members.length > 0 && (
            <View>
              <SectionHeader title="Research Team" />
              <InfoCard>
                {proposal.members.map((member, i) => (
                  <View key={`${member.email}-${i}`}>
                    {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200" />}
                    <View className="flex-row items-center gap-3">
                      <Avatar name={member.fullName} size="sm" />
                      <View className="flex-1">
                        <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">
                          {member.fullName}
                          {member.isSecretary ? ' (Secretary)' : ''}
                        </Text>
                        <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                          {[member.academicTitle, member.role, member.department].filter(Boolean).join(' · ')}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </InfoCard>
            </View>
          )}

          {/* Expected Products */}
          <View>
            <SectionHeader title="Expected Products" />
            <ExpectedProductsCard proposalId={id} editable={isDraft} />
          </View>

          {/* Documents */}
          <View>
            <SectionHeader title="Documents" />
            <ProposalDocumentsCard proposalId={id} editable={isDraft} />
          </View>

          {proposal.status === PROPOSAL_STATUS.APPROVED && (
            <TouchableOpacity
              onPress={() => router.push('/(faculty)/reports')}
              activeOpacity={0.7}
              className="flex-row items-center justify-between bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="bar-chart-outline" size={20} color={colors.accent.primary} />
                <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">
                  Progress & Final Reports
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.icon.muted} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <SubmitProposalSheet
        visible={submitSheetVisible}
        isSubmitting={isSubmitting}
        onClose={() => setSubmitSheetVisible(false)}
        onConfirm={(confirmCv) =>
          submitProposal(confirmCv, {
            onSuccess: () => setSubmitSheetVisible(false),
          })
        }
      />
    </SafeAreaView>
  );
}
