import { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/components/ui/Badge';
import type { BadgeVariant } from '@/shared/components/ui/Badge';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import {
  ROUND_TYPE_LABELS,
  ROUND_STATUS,
  ROUND_STATUS_LABELS,
  MEMBER_ROLE_LABELS,
  PLATFORM_LABELS,
  localizeLabel,
  type ReviewRoundType,
} from '@/constants/statuses';
import type { MyMembership } from '../types/membership.types';
import { useMeetings } from '@/features/meeting/hooks/useMeetings';
import { useTheme } from '@/hooks/useTheme';
import { formatDateTime } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';

const roundStatusVariant: Record<string, BadgeVariant> = {
  [ROUND_STATUS.PENDING]: 'default',
  [ROUND_STATUS.OPEN]: 'success',
  [ROUND_STATUS.CLOSED]: 'default',
  PASSED: 'success',
  FAILED: 'danger',
};

interface MembershipCardProps {
  membership: MyMembership;
  onPress?: () => void;
  actions?: React.ReactNode;
}

export function MembershipCard({ membership, onPress, actions }: MembershipCardProps) {
  const { t } = useTranslation('reviewer');
  const { colors } = useTheme();
  const { data: meetings } = useMeetings();

  const meeting = useMemo(() => {
    return meetings?.find((m) => m.councilId === membership.councilId);
  }, [meetings, membership.councilId]);

  const content = (
    <GlassSurface rounded={24} className="p-4 gap-3">
      <Text className="text-neutral-900 dark:text-neutral-50 text-base font-semibold leading-snug" numberOfLines={2}>
        {membership.proposalTitleVI || t('membershipCard.untitledProposal')}
      </Text>

      <View className="flex-row items-center gap-2 flex-wrap">
        {membership.roundType && (
          <Badge
            label={ROUND_TYPE_LABELS[membership.roundType as ReviewRoundType] ?? membership.roundType}
            variant="purple"
            size="sm"
          />
        )}
        {membership.memberRole && (
          <Badge label={localizeLabel(MEMBER_ROLE_LABELS, membership.memberRole)} variant="info" size="sm" />
        )}
        {membership.roundStatus && (
          <Badge
            label={localizeLabel(ROUND_STATUS_LABELS, membership.roundStatus)}
            variant={roundStatusVariant[membership.roundStatus] ?? 'default'}
            size="sm"
          />
        )}
        {membership.proposalStatus && <Badge label={membership.proposalStatus} variant="default" size="sm" />}
      </View>

      {meeting && (
        <>
          <View className="h-px bg-neutral-100 dark:bg-dark-200 my-1" />
          <View className="gap-2 bg-neutral-50/50 dark:bg-dark-900/10 rounded-xl p-3 border border-neutral-100 dark:border-dark-200">
            <View className="flex-row items-center gap-2">
              <Ionicons name="calendar-outline" size={14} color={colors.accent.primary} />
              <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">Thời gian họp:</Text>
              <Text className="text-neutral-800 dark:text-neutral-200 text-xs font-medium">{formatDateTime(meeting.scheduledAt)}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Ionicons name="location-outline" size={14} color={colors.accent.success} />
              <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">Hình thức:</Text>
              <Text className="text-neutral-800 dark:text-neutral-200 text-xs font-medium">
                {localizeLabel(PLATFORM_LABELS, meeting.platform) || (meeting.meetingLink ? 'Trực tuyến' : 'Chưa xác định')}
              </Text>
            </View>
          </View>
        </>
      )}

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
