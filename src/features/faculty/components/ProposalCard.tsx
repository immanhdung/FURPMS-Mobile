import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/shared/components/ui/Badge';
import { useTheme } from '@/hooks/useTheme';
import { formatRelative } from '@/utils/date';
import { getStatusLabel } from '@/utils/status';
import { PROPOSAL_STATUS } from '@/constants/statuses';
import type { BadgeVariant } from '@/shared/components/ui/Badge';
import type { ProposalSummary } from '../types/proposal.types';

const statusVariant: Record<string, BadgeVariant> = {
  [PROPOSAL_STATUS.DRAFT]: 'default',
  [PROPOSAL_STATUS.SUBMITTED]: 'info',
  [PROPOSAL_STATUS.UNDER_REVIEW]: 'warning',
  [PROPOSAL_STATUS.APPROVED]: 'success',
  [PROPOSAL_STATUS.REJECTED]: 'danger',
  [PROPOSAL_STATUS.WITHDRAWN]: 'default',
};

interface ProposalCardProps {
  proposal: ProposalSummary;
  onPress: () => void;
}

export function ProposalCard({ proposal, onPress }: ProposalCardProps) {
  const { colors } = useTheme();
  const title = proposal.titleVI || proposal.titleEN || 'Untitled proposal';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-3"
    >
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
        <Badge label={getStatusLabel(proposal.status)} variant={statusVariant[proposal.status ?? ''] ?? 'default'} size="sm" />
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
    </TouchableOpacity>
  );
}
