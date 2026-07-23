import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/shared/components/ui/Badge';
import { Avatar } from '@/shared/components/ui/Avatar';
import { useTheme } from '@/hooks/useTheme';
import { formatBudget } from '@/utils/currency';
import { formatRelative } from '@/utils/date';
import { getStatusLabel } from '@/utils/status';
import type { BadgeVariant } from '@/shared/components/ui/Badge';
import type { ProposalSummary, ProposalStatus } from '../types/proposal.types';

const statusVariant: Record<ProposalStatus, BadgeVariant> = {
  DRAFT: 'default',
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  REVISION_REQUIRED: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

interface ProposalCardProps {
  proposal: ProposalSummary;
  onPress: () => void;
}

export function ProposalCard({ proposal, onPress }: ProposalCardProps) {
  const { colors } = useTheme();
  const visibleTeam = proposal.team.slice(0, 3);
  const extraCount = proposal.team.length - 3;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-3"
    >
      <View className="flex-row items-start gap-3">
        <View className="flex-1 gap-1.5">
          <Text
            className="text-neutral-900 dark:text-neutral-50 text-base font-semibold leading-snug"
            numberOfLines={2}
          >
            {proposal.title}
          </Text>
          <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
            {proposal.researchField}
          </Text>
        </View>
        <Badge
          label={getStatusLabel(proposal.status)}
          variant={statusVariant[proposal.status]}
          size="sm"
        />
      </View>

      <View className="h-px bg-neutral-100 dark:bg-dark-200" />

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="wallet-outline" size={13} color={colors.icon.muted} />
          <Text className="text-neutral-600 dark:text-dark-500 text-xs font-medium">
            {formatBudget(proposal.budget)}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="flex-row">
            {visibleTeam.map((m, i) => (
              <View key={m.id} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: visibleTeam.length - i }}>
                <Avatar name={m.name} size="xs" />
              </View>
            ))}
            {extraCount > 0 && (
              <View
                className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-dark-300 items-center justify-center"
                style={{ marginLeft: -8 }}
              >
                <Text className="text-neutral-600 dark:text-dark-500 text-xs font-medium">
                  +{extraCount}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={12} color={colors.icon.muted} />
            <Text className="text-neutral-400 dark:text-dark-500 text-xs font-sans">
              {formatRelative(proposal.updatedAt)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
