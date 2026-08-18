import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/components/ui/Badge';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { useTheme } from '@/hooks/useTheme';
import { formatRelative } from '@/utils/date';
import { getStatusLabel, resolveProposalStatus } from '@/utils/status';
import { PROPOSAL_STATUS } from '@/constants/statuses';
import { useMyContracts } from '@/features/faculty/hooks/useContracts';
import { useFinalReport } from '@/features/faculty/hooks/useFinalReports';
import type { BadgeVariant } from '@/shared/components/ui/Badge';
import type { ProposalSummary } from '../types/proposal.types';

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

interface ProposalCardProps {
  proposal: ProposalSummary;
  onPress: () => void;
}

export function ProposalCard({ proposal, onPress }: ProposalCardProps) {
  const { t } = useTranslation('faculty');
  const { colors } = useTheme();
  const { data: contracts } = useMyContracts();
  const contract = contracts?.find((c) => c.proposalId != null && String(c.proposalId) === String(proposal.id));
  const { data: finalReport } = useFinalReport(contract?.id);
  const resolvedStatus = resolveProposalStatus(proposal.status, contracts, proposal.id, finalReport?.status) ?? proposal.status ?? '';
  const title = proposal.titleVI || proposal.titleEN || t('proposal.untitled');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <GlassSurface rounded={24} className="p-4 gap-3">
        <View className="flex-row items-start gap-3">
          <View className="flex-1 gap-1.5">
            <Text className="text-neutral-900 dark:text-neutral-50 text-base font-semibold leading-snug" numberOfLines={2}>
              {title}
            </Text>
            {(proposal.cycleName || proposal.trackName) && (
              <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                {[proposal.cycleName, proposal.trackName].filter(Boolean).join(' · ')}
              </Text>
            )}
          </View>
          <Badge label={getStatusLabel(resolvedStatus)} variant={statusVariant[resolvedStatus] ?? 'default'} size="sm" />
        </View>

        <View className="h-px bg-neutral-100 dark:bg-dark-200" />

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="calendar-outline" size={13} color={colors.icon.muted} />
            <Text className="text-neutral-600 dark:text-dark-500 text-xs font-medium">
              {proposal.createdAt ? formatRelative(proposal.createdAt) : '—'}
            </Text>
          </View>
        </View>
      </GlassSurface>
    </TouchableOpacity>
  );
}
