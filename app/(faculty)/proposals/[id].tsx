import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal, Pressable, Animated } from 'react-native';
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
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { ListRow } from '@/shared/components/ui/ListRow';
import { ProposalStatusTimeline } from '@/features/faculty/components/ProposalStatusTimeline';
import { ProposalDocumentsCard } from '@/features/faculty/components/ProposalDocumentsCard';
import { ExpectedProductsCard } from '@/features/faculty/components/ExpectedProductsCard';
import { SubmitProposalSheet } from '@/features/faculty/components/SubmitProposalSheet';
import { formatDate } from '@/utils/date';
import { getStatusLabel } from '@/utils/status';
import { PROPOSAL_STATUS } from '@/constants/statuses';
import type { BadgeVariant } from '@/shared/components/ui/Badge';

const statusVariant: Record<string, BadgeVariant> = {
  [PROPOSAL_STATUS.DRAFT]:              'default',
  [PROPOSAL_STATUS.SUBMITTED]:          'info',
  [PROPOSAL_STATUS.UNDER_REVIEW]:       'warning',
  [PROPOSAL_STATUS.APPROVED]:           'success',
  [PROPOSAL_STATUS.REJECTED]:           'danger',
  [PROPOSAL_STATUS.WITHDRAWN]:          'default',
  [PROPOSAL_STATUS.IN_PROGRESS_REPORT]: 'purple',
  [PROPOSAL_STATUS.IN_FINAL_REPORT]:    'info',
  [PROPOSAL_STATUS.IN_ACCEPTANCE]:      'warning',
  [PROPOSAL_STATUS.ACCEPTANCE_PASSED]:  'success',
  [PROPOSAL_STATUS.ACCEPTANCE_FAILED]:  'danger',
};

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-neutral-900 dark:text-neutral-50 text-base font-semibold mb-3">{title}</Text>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <GlassSurface rounded={24} className="p-4 gap-3">
      {children}
    </GlassSurface>
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

/** Màn hình chúc mừng khi đề tài nghiệm thu đạt */
function CongratulatoryBanner({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 24 }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: 32,
            overflow: 'hidden',
          }}
        >
          {/* Gradient header */}
          <View
            style={{
              backgroundColor: '#7C3AED',
              paddingVertical: 40,
              paddingHorizontal: 24,
              alignItems: 'center',
              gap: 16,
            }}
          >
            {/* Trophy emoji large */}
            <Text style={{ fontSize: 64, textAlign: 'center' }}>🏆</Text>
            <Text style={{ fontSize: 26, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', lineHeight: 34 }}>
              Chúc mừng!
            </Text>
            <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
              Đề tài của bạn đã hoàn thành{'\n'}toàn bộ vòng nghiệm thu
            </Text>
          </View>

          <View style={{ padding: 24, gap: 16 }}>
            {/* Proposal title */}
            <View style={{ backgroundColor: '#F5F3FF', borderRadius: 16, padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: '#7C3AED', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                ĐỀ TÀI
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F1F2E', textAlign: 'center', lineHeight: 24 }}>
                {title}
              </Text>
            </View>

            {/* Stats row */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[
                { icon: '✅', label: 'Vòng đánh giá', sub: 'Đạt' },
                { icon: '📄', label: 'Báo cáo', sub: 'Hoàn thành' },
                { icon: '🎯', label: 'Nghiệm thu', sub: 'Đạt' },
              ].map((item) => (
                <View
                  key={item.label}
                  style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 }}
                >
                  <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                  <Text style={{ fontSize: 10, color: '#6B7280', textAlign: 'center', fontWeight: '500' }}>{item.label}</Text>
                  <Text style={{ fontSize: 11, color: '#059669', textAlign: 'center', fontWeight: '700' }}>{item.sub}</Text>
                </View>
              ))}
            </View>

            <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
              Đây là thành tích đáng tự hào! Đề tài đã hoàn thành tất cả các vòng xét duyệt và nghiệm thu thành công.
            </Text>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#7C3AED',
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>🎉  Tuyệt vời!</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
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
  const [congratsVisible, setCongratsVisible] = useState(true);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (isLoading) return <LoadingState message={t('proposalDetail.loading')} />;
  if (isError || !proposal) {
    return <ErrorState title={t('proposalDetail.errorTitle')} message={t('proposalDetail.errorMessage')} onRetry={refetch} />;
  }

  const isDraft = proposal.status === PROPOSAL_STATUS.DRAFT;
  const canWithdraw = proposal.status === PROPOSAL_STATUS.SUBMITTED || proposal.status === PROPOSAL_STATUS.UNDER_REVIEW;
  const isAcceptancePassed = proposal.status === PROPOSAL_STATUS.ACCEPTANCE_PASSED;
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
        contentContainerStyle={{ paddingBottom: 110 }}
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

        {/* Acceptance passed banner */}
        {isAcceptancePassed && (
          <View className="px-5 mb-5">
            <TouchableOpacity
              onPress={() => setCongratsVisible(true)}
              activeOpacity={0.85}
              className="rounded-2xl overflow-hidden"
            >
              <View style={{ backgroundColor: '#7C3AED', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 32 }}>🏆</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Nghiệm thu đạt!</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>
                    Đề tài đã hoàn thành toàn bộ vòng nghiệm thu. Nhấn để xem chi tiết.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
              </View>
            </TouchableOpacity>
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
            <ListRow
              icon="bar-chart-outline"
              label={t('proposalDetail.progressAndFinalReports')}
              onPress={() => router.push('/(faculty)/reports')}
            />
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

      {/* Congratulations modal for acceptance_passed */}
      {isAcceptancePassed && (
        <CongratulatoryBanner
          title={title}
          onClose={() => setCongratsVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}
