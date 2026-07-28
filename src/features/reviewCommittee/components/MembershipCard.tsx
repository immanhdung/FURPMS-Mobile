import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/components/ui/Badge';
import type { BadgeVariant } from '@/shared/components/ui/Badge';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { ROUND_TYPE_LABELS, ROUND_STATUS, type ReviewRoundType } from '@/constants/statuses';
import type { MyMembership } from '../types/membership.types';

const roundStatusVariant: Record<string, BadgeVariant> = {
  [ROUND_STATUS.PENDING]: 'default',
  [ROUND_STATUS.OPEN]: 'success',
  [ROUND_STATUS.CLOSED]: 'default',
};

interface MembershipCardProps {
  membership: MyMembership;
  onPress?: () => void;
  actions?: React.ReactNode;
}

export function MembershipCard({ membership, onPress, actions }: MembershipCardProps) {
  const { t } = useTranslation('reviewer');

  const content = (
    <GlassSurface rounded={24} className="p-4 gap-3">
      <Text className="text-neutral-900 dark:text-neutral-50 text-base font-semibold leading-snug" numberOfLines={2}>
        {membership.proposalTitleVI || t('membershipCard.untitledProposal')}
      </Text>

      <View className="flex-row items-center gap-2 flex-wrap">
        {membership.roundType && (
          <Badge label={ROUND_TYPE_LABELS[membership.roundType as ReviewRoundType] ?? membership.roundType} variant="purple" size="sm" />
        )}
        {membership.memberRole && <Badge label={membership.memberRole} variant="info" size="sm" />}
        {membership.roundStatus && (
          <Badge label={membership.roundStatus} variant={roundStatusVariant[membership.roundStatus] ?? 'default'} size="sm" />
        )}
        {membership.proposalStatus && <Badge label={membership.proposalStatus} variant="default" size="sm" />}
      </View>

      {actions && <View className="flex-row gap-2 mt-1">{actions}</View>}
    </GlassSurface>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
