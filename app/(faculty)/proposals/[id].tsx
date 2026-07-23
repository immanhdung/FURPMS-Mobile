import { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useProposal, useSubmitProposal, useDeleteProposal } from '@/features/faculty/hooks/useProposals';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { Avatar } from '@/shared/components/ui/Avatar';
import { formatDate, formatRelative } from '@/utils/date';
import { formatBudget } from '@/utils/currency';
import { getStatusLabel } from '@/utils/status';
import type { BadgeVariant } from '@/shared/components/ui/Badge';
import type { ProposalStatus, BudgetCategory, TeamMemberRole } from '@/features/faculty/types/proposal.types';

const statusVariant: Record<ProposalStatus, BadgeVariant> = {
  DRAFT: 'default',
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  REVISION_REQUIRED: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

const categoryLabel: Record<BudgetCategory, string> = {
  PERSONNEL: 'Personnel',
  EQUIPMENT: 'Equipment',
  OVERHEAD: 'Overhead',
  OTHER: 'Other',
};

const roleLabel: Record<TeamMemberRole, string> = {
  PI: 'Principal Investigator',
  CO_PI: 'Co-Investigator',
  MEMBER: 'Team Member',
};

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-neutral-900 dark:text-neutral-50 text-base font-semibold mb-3">
      {title}
    </Text>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-3">
      {children}
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-start gap-3">
      <Ionicons
        name={icon as React.ComponentProps<typeof Ionicons>['name']}
        size={16}
        color={colors.icon.muted}
        style={{ marginTop: 1 }}
      />
      <View className="flex-1">
        <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mb-0.5">{label}</Text>
        <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-sans leading-snug">{value}</Text>
      </View>
    </View>
  );
}

export default function ProposalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const { data: proposal, isLoading, isError, refetch } = useProposal(id);
  const { mutate: submitProposal, isPending: isSubmitting } = useSubmitProposal(id);
  const { mutate: deleteProposal, isPending: isDeleting } = useDeleteProposal();

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleSubmit = () => {
    Alert.alert(
      'Submit Proposal',
      'Are you sure you want to submit this proposal for review? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          style: 'default',
          onPress: () =>
            submitProposal(undefined, {
              onSuccess: () => {
                Alert.alert('Submitted', 'Your proposal has been submitted for review.');
              },
            }),
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Proposal',
      'Are you sure you want to delete this draft? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            deleteProposal(id, {
              onSuccess: () => router.back(),
            }),
        },
      ],
    );
  };

  if (isLoading) return <LoadingState message="Loading proposal…" />;
  if (isError || !proposal)
    return (
      <ErrorState
        title="Could not load proposal"
        message="Check your connection and try again."
        onRetry={refetch}
      />
    );

  const canSubmit = proposal.status === 'DRAFT' || proposal.status === 'REVISION_REQUIRED';
  const canEdit = proposal.status === 'DRAFT' || proposal.status === 'REVISION_REQUIRED';
  const canDelete = proposal.status === 'DRAFT';

  const totalBudget = proposal.budgetItems.reduce((s, b) => s + b.amount, 0);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
            colors={[colors.accent.primary]}
          />
        }
      >
        {/* Hero */}
        <View className="px-5 pt-4 pb-5 gap-3">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Badge
              label={getStatusLabel(proposal.status)}
              variant={statusVariant[proposal.status]}
              size="md"
            />
            <Badge label={proposal.researchField} variant="default" size="md" />
          </View>
          <Text className="text-neutral-900 dark:text-neutral-50 text-xl font-bold leading-snug">
            {proposal.title}
          </Text>
          <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
            Updated {formatRelative(proposal.updatedAt)}
          </Text>
        </View>

        {/* Action buttons */}
        {(canSubmit || canEdit || canDelete) && (
          <View className="px-5 mb-5 flex-row gap-3">
            {canSubmit && (
              <Button
                label="Submit for Review"
                variant="primary"
                size="md"
                loading={isSubmitting}
                onPress={handleSubmit}
                fullWidth
              />
            )}
            {canEdit && (
              <Button
                label="Edit"
                variant="secondary"
                size="md"
                onPress={() => router.push(`/(faculty)/proposals/create?edit=${id}`)}
              />
            )}
            {canDelete && (
              <Button
                label="Delete"
                variant="danger"
                size="md"
                loading={isDeleting}
                onPress={handleDelete}
              />
            )}
          </View>
        )}

        <View className="px-5 gap-5">
          {/* Overview */}
          <View>
            <SectionHeader title="Overview" />
            <InfoCard>
              <View className="gap-1">
                <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">Abstract</Text>
                <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-sans leading-relaxed">
                  {proposal.abstract}
                </Text>
              </View>
              <View className="h-px bg-neutral-100 dark:bg-dark-200" />
              <InfoRow icon="calendar-outline" label="Start Date" value={formatDate(proposal.startDate)} />
              <InfoRow icon="calendar" label="End Date" value={formatDate(proposal.endDate)} />
              <InfoRow icon="wallet-outline" label="Total Budget" value={formatBudget(proposal.budget)} />
            </InfoCard>
          </View>

          {/* Research Content */}
          <View>
            <SectionHeader title="Research Content" />
            <InfoCard>
              <View className="gap-1">
                <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">Objectives</Text>
                <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-sans leading-relaxed">
                  {proposal.objectives}
                </Text>
              </View>
              <View className="h-px bg-neutral-100 dark:bg-dark-200" />
              <View className="gap-1">
                <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">Methodology</Text>
                <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-sans leading-relaxed">
                  {proposal.methodology}
                </Text>
              </View>
              <View className="h-px bg-neutral-100 dark:bg-dark-200" />
              <View className="gap-1">
                <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">Expected Outcomes</Text>
                <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-sans leading-relaxed">
                  {proposal.expectedOutcomes}
                </Text>
              </View>
            </InfoCard>
          </View>

          {/* Team */}
          {proposal.team.length > 0 && (
            <View>
              <SectionHeader title="Research Team" />
              <InfoCard>
                {proposal.team.map((member, i) => (
                  <View key={member.id}>
                    {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200" />}
                    <View className="flex-row items-center gap-3">
                      <Avatar name={member.name} size="sm" />
                      <View className="flex-1">
                        <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">
                          {member.name}
                        </Text>
                        <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                          {roleLabel[member.role]}
                          {member.department ? ` · ${member.department}` : ''}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </InfoCard>
            </View>
          )}

          {/* Budget */}
          {proposal.budgetItems.length > 0 && (
            <View>
              <SectionHeader title="Budget Breakdown" />
              <InfoCard>
                {proposal.budgetItems.map((item, i) => (
                  <View key={item.id}>
                    {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200" />}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">
                          {item.description}
                        </Text>
                        <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                          {categoryLabel[item.category]}
                        </Text>
                      </View>
                      <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">
                        {formatBudget(item.amount)}
                      </Text>
                    </View>
                  </View>
                ))}
                <View className="h-px bg-neutral-200 dark:bg-dark-300" />
                <View className="flex-row items-center justify-between">
                  <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold">
                    Total
                  </Text>
                  <Text className="text-violet-600 dark:text-violet-400 text-sm font-bold">
                    {formatBudget(totalBudget)}
                  </Text>
                </View>
              </InfoCard>
            </View>
          )}

          {/* Review Feedback */}
          {proposal.reviews.length > 0 && (
            <View>
              <SectionHeader title="Review Feedback" />
              {proposal.reviews.map((review) => (
                <InfoCard key={review.id}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Avatar name={review.reviewerName} size="xs" />
                      <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">
                        {review.reviewerName}
                      </Text>
                    </View>
                    <Badge
                      label={review.decision === 'APPROVE' ? 'Approved' : review.decision === 'REJECT' ? 'Rejected' : 'Needs Revision'}
                      variant={review.decision === 'APPROVE' ? 'success' : review.decision === 'REJECT' ? 'danger' : 'warning'}
                    />
                  </View>
                  <View className="gap-1">
                    <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">Feedback</Text>
                    <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-sans leading-relaxed">
                      {review.feedback}
                    </Text>
                  </View>
                  {review.revisionInstructions && (
                    <View className="gap-1 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                      <Text className="text-amber-700 dark:text-amber-300 text-xs font-semibold">
                        Revision Instructions
                      </Text>
                      <Text className="text-amber-800 dark:text-amber-200 text-sm font-sans leading-relaxed">
                        {review.revisionInstructions}
                      </Text>
                    </View>
                  )}
                  <Text className="text-neutral-400 dark:text-dark-500 text-xs font-sans">
                    Submitted {formatDate(review.submittedAt)}
                  </Text>
                </InfoCard>
              ))}
            </View>
          )}

          {/* Status Timeline */}
          {proposal.statusHistory.length > 0 && (
            <View>
              <SectionHeader title="Status Timeline" />
              <InfoCard>
                {proposal.statusHistory.map((item, i) => (
                  <View key={i} className="flex-row gap-3">
                    <View className="items-center gap-1 pt-0.5">
                      <View
                        className={`w-2 h-2 rounded-full ${
                          i === proposal.statusHistory.length - 1
                            ? 'bg-violet-500'
                            : 'bg-neutral-300 dark:bg-dark-300'
                        }`}
                      />
                      {i < proposal.statusHistory.length - 1 && (
                        <View className="w-px flex-1 bg-neutral-200 dark:bg-dark-200 min-h-[20px]" />
                      )}
                    </View>
                    <View className="flex-1 pb-3">
                      <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">
                        {getStatusLabel(item.status)}
                      </Text>
                      <View className="flex-row items-center gap-1.5 mt-0.5">
                        <Text className="text-neutral-400 dark:text-dark-500 text-xs font-sans">
                          {formatDate(item.timestamp)}
                        </Text>
                        {item.actorName && (
                          <>
                            <Text className="text-neutral-300 dark:text-dark-300 text-xs">·</Text>
                            <Text className="text-neutral-400 dark:text-dark-500 text-xs font-sans">
                              {item.actorName}
                            </Text>
                          </>
                        )}
                      </View>
                      {item.note && (
                        <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mt-1">
                          {item.note}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </InfoCard>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
