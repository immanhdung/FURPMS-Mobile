import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['faculty', 'common']);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const { data: proposal, isLoading, isError, refetch } = useProposal(id);
  const { mutate: submitProposal, isPending: isSubmitting } = useSubmitProposal();
  const { mutate: withdrawProposal, isPending: isWithdrawing } = useWithdrawProposal(id);
  const [submitSheetVisible, setSubmitSheetVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (isLoading) return <LoadingState message={t('proposalDetail.loading')} />;
  if (isError || !proposal) {
    return <ErrorState title={t('proposalDetail.errorTitle')} message={t('proposalDetail.errorMessage')} onRetry={refetch} />;
  }

  const isDraft = proposal.status === PROPOSAL_STATUS.DRAFT;
  const canWithdraw = proposal.status === PROPOSAL_STATUS.SUBMITTED || proposal.status === PROPOSAL_STATUS.UNDER_REVIEW;
  const title = proposal.titleVI || proposal.titleEN || t('proposal.untitled');

  function handleWithdraw() {
    Alert.alert(t('proposalDetail.withdrawAlertTitle'), t('proposalDetail.withdrawAlertMessage'), [
      { text: t('common:buttons.cancel'), style: 'cancel' },
      { text: t('proposalDetail.withdraw'), style: 'destructive', onPress: () => withdrawProposal() },
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
            <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">{t('proposalDetail.created', { date: formatDate(proposal.createdAt) })}</Text>
          )}
          <ProposalStatusTimeline status={proposal.status} />
        </View>

        {/* Action buttons */}
        {(isDraft || canWithdraw) && (
          <View className="px-5 mb-5 flex-row gap-3">
            {isDraft && (
              <>
                <Button label={t('proposalDetail.submit')} variant="primary" size="md" onPress={() => setSubmitSheetVisible(true)} />
                <Button
                  label={t('proposalDetail.edit')}
                  variant="secondary"
                  size="md"
                  onPress={() => router.push(`/(faculty)/proposals/create?edit=${id}`)}
                />
              </>
            )}
            {canWithdraw && (
              <Button label={t('proposalDetail.withdraw')} variant="danger" size="md" loading={isWithdrawing} onPress={handleWithdraw} />
            )}
          </View>
        )}

        <View className="px-5 gap-5">
          {/* Overview */}
          <View>
            <SectionHeader title={t('proposalDetail.overview')} />
            <InfoCard>
              <TextField label={t('fields.abstract')} value={proposal.abstractEN} />
              <View className="h-px bg-neutral-100 dark:bg-dark-200" />
              <TextField label={t('fields.objectives')} value={proposal.objectives} />
              <TextField label={t('fields.methodology')} value={proposal.methodology} />
              <TextField label={t('fields.expectedOutput')} value={proposal.expectedOutput} />
              <View className="h-px bg-neutral-100 dark:bg-dark-200" />
              <View className="flex-row gap-6">
                <View className="flex-1">
                  <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{t('fields.duration')}</Text>
                  <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium mt-0.5">
                    {t('fields.durationValue', { count: proposal.durationMonths })}
                  </Text>
                </View>
                {proposal.fundingMethod && (
                  <View className="flex-1">
                    <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{t('fields.funding')}</Text>
                    <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium mt-0.5">
                      {proposal.fundingMethod === 'PARTIAL' ? t('fields.fundingPartial') : t('fields.fundingWhole')}
                    </Text>
                  </View>
                )}
              </View>
            </InfoCard>
          </View>

          {/* Additional details */}
          {(proposal.urgency || proposal.novelty || proposal.applicationPotential || proposal.transferPotential || proposal.facilities) && (
            <View>
              <SectionHeader title={t('proposalDetail.researchAssessment')} />
              <InfoCard>
                <TextField label={t('fields.urgency')} value={proposal.urgency} />
                <TextField label={t('fields.novelty')} value={proposal.novelty} />
                <TextField label={t('fields.applicationPotential')} value={proposal.applicationPotential} />
                <TextField label={t('fields.transferPotential')} value={proposal.transferPotential} />
                <TextField label={t('fields.facilities')} value={proposal.facilities} />
              </InfoCard>
            </View>
          )}

          {/* Team */}
          {proposal.members && proposal.members.length > 0 && (
            <View>
              <SectionHeader title={t('proposalDetail.researchTeam')} />
              <InfoCard>
                {proposal.members.map((member, i) => (
                  <View key={`${member.email}-${i}`}>
                    {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200" />}
                    <View className="flex-row items-center gap-3">
                      <Avatar name={member.fullName} size="sm" />
                      <View className="flex-1">
                        <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">
                          {member.fullName}
                          {member.isSecretary ? t('proposalDetail.secretarySuffix') : ''}
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
            <SectionHeader title={t('proposalDetail.expectedProducts')} />
            <ExpectedProductsCard proposalId={id} editable={isDraft} />
          </View>

          {/* Documents */}
          <View>
            <SectionHeader title={t('proposalDetail.documents')} />
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
                  {t('proposalDetail.progressAndFinalReports')}
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
          submitProposal(
            { id, confirmCv },
            { onSuccess: () => setSubmitSheetVisible(false) },
          )
        }
      />
    </SafeAreaView>
  );
}
