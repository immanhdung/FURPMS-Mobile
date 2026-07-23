import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { formatDateTime, formatDuration } from '@/utils/date';
import type { BadgeVariant } from '@/shared/components/ui/Badge';
import { Badge } from '@/shared/components/ui/Badge';
import type { MeetingSummary, MeetingType, MeetingStatus } from '../types/meeting.types';

const typeVariant: Record<MeetingType, BadgeVariant> = {
  REVIEW: 'purple',
  DISCUSSION: 'info',
  GENERAL: 'default',
};

const typeLabel: Record<MeetingType, string> = {
  REVIEW: 'Review',
  DISCUSSION: 'Discussion',
  GENERAL: 'General',
};

const statusIcon: Record<MeetingStatus, string> = {
  UPCOMING: 'time-outline',
  IN_PROGRESS: 'radio-button-on',
  COMPLETED: 'checkmark-circle-outline',
  CANCELLED: 'close-circle-outline',
};

const statusColor: Record<MeetingStatus, string> = {
  UPCOMING: '#5E6AD2',
  IN_PROGRESS: '#22C55E',
  COMPLETED: '#9F9FAD',
  CANCELLED: '#EF4444',
};

interface MeetingCardProps {
  meeting: MeetingSummary;
  onPress: () => void;
}

export function MeetingCard({ meeting, onPress }: MeetingCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-3"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1.5">
          <Text
            className="text-neutral-900 dark:text-neutral-50 text-base font-semibold leading-snug"
            numberOfLines={2}
          >
            {meeting.title}
          </Text>
          {meeting.linkedProposalTitle && (
            <Text
              className="text-violet-600 dark:text-violet-400 text-xs font-medium"
              numberOfLines={1}
            >
              {meeting.linkedProposalTitle}
            </Text>
          )}
        </View>
        <Badge label={typeLabel[meeting.type]} variant={typeVariant[meeting.type]} size="sm" />
      </View>

      <View className="h-px bg-neutral-100 dark:bg-dark-200" />

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="calendar-outline" size={13} color={colors.icon.muted} />
          <Text className="text-neutral-600 dark:text-dark-500 text-xs font-medium">
            {formatDateTime(meeting.scheduledAt)}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Ionicons name="hourglass-outline" size={12} color={colors.icon.muted} />
            <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
              {formatDuration(meeting.durationMinutes)}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons
              name={statusIcon[meeting.status] as React.ComponentProps<typeof Ionicons>['name']}
              size={13}
              color={statusColor[meeting.status]}
            />
            <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans capitalize">
              {meeting.status.toLowerCase().replace('_', ' ')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
