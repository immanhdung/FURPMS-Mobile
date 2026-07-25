import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { formatDateTime, formatDuration, isUpcoming } from '@/utils/date';
import { Badge } from '@/shared/components/ui/Badge';
import type { Meeting } from '../types/meeting.types';

interface MeetingCardProps {
  meeting: Meeting;
  proposalTitle?: string | null;
  onPress: () => void;
}

export function MeetingCard({ meeting, proposalTitle, onPress }: MeetingCardProps) {
  const { t } = useTranslation('reviewer');
  const { colors } = useTheme();
  const upcoming = isUpcoming(meeting.scheduledAt);

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
            {meeting.title || t('meetingCard.councilMeeting')}
          </Text>
          {proposalTitle && (
            <Text className="text-violet-600 dark:text-violet-400 text-xs font-medium" numberOfLines={1}>
              {proposalTitle}
            </Text>
          )}
        </View>
        {meeting.status ? (
          <Badge label={meeting.status} variant={upcoming ? 'info' : 'default'} size="sm" />
        ) : null}
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
          {meeting.platform && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="videocam-outline" size={12} color={colors.icon.muted} />
              <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{meeting.platform}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
