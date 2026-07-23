import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/shared/components/ui/Badge';
import { formatDate } from '@/utils/date';
import type { ReviewSubmissionSummary, ReviewPriority, ReviewStatus } from '../types/review.types';
import type { BadgeVariant } from '@/shared/components/ui/Badge';

interface ReviewQueueCardProps {
  review: ReviewSubmissionSummary;
  onPress: () => void;
}

const priorityConfig: Record<ReviewPriority, { label: string; variant: BadgeVariant; color: string }> = {
  HIGH: { label: 'High Priority', variant: 'danger', color: '#ef4444' },
  MEDIUM: { label: 'Medium', variant: 'warning', color: '#f59e0b' },
  LOW: { label: 'Low', variant: 'default', color: '#6b7280' },
};

const statusConfig: Record<ReviewStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  IN_PROGRESS: { label: 'In Progress', variant: 'info' },
  COMPLETED: { label: 'Completed', variant: 'success' },
};

function getDaysRemaining(dueDate: string): number {
  const due = new Date(dueDate).getTime();
  const now = Date.now();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

export function ReviewQueueCard({ review, onPress }: ReviewQueueCardProps) {
  const { colors } = useTheme();
  const daysRemaining = getDaysRemaining(review.dueDate);
  const isOverdue = daysRemaining < 0;
  const isUrgent = daysRemaining >= 0 && daysRemaining <= 2;
  const priority = priorityConfig[review.priority];
  const status = statusConfig[review.status];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-3"
    >
      {/* Top row: status + priority */}
      <View className="flex-row items-center justify-between gap-2">
        <Badge label={status.label} variant={status.variant} size="sm" />
        <Badge label={priority.label} variant={priority.variant} size="sm" />
      </View>

      {/* Title */}
      <Text
        className="text-neutral-900 dark:text-neutral-50 text-base font-semibold leading-snug"
        numberOfLines={2}
      >
        {review.proposalTitle}
      </Text>

      {/* Field */}
      <View className="flex-row items-center gap-1.5">
        <Ionicons name="flask-outline" size={13} color={colors.icon.muted} />
        <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans" numberOfLines={1}>
          {review.proposalField}
        </Text>
      </View>

      {/* Footer: due date + days remaining */}
      <View className="flex-row items-center justify-between pt-1 border-t border-neutral-100 dark:border-dark-200">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="calendar-outline" size={13} color={colors.icon.muted} />
          <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
            Due {formatDate(review.dueDate)}
          </Text>
        </View>

        {review.status !== 'COMPLETED' && (
          <View
            className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${
              isOverdue
                ? 'bg-red-50 dark:bg-red-900/20'
                : isUrgent
                ? 'bg-amber-50 dark:bg-amber-900/20'
                : 'bg-neutral-50 dark:bg-dark-100'
            }`}
          >
            <Ionicons
              name={isOverdue ? 'alert-circle' : 'time-outline'}
              size={11}
              color={isOverdue ? colors.accent.danger : isUrgent ? colors.accent.warning : colors.icon.muted}
            />
            <Text
              className={`text-xs font-medium ${
                isOverdue
                  ? 'text-red-600 dark:text-red-400'
                  : isUrgent
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-neutral-500 dark:text-dark-500'
              }`}
            >
              {isOverdue
                ? `${Math.abs(daysRemaining)}d overdue`
                : daysRemaining === 0
                ? 'Due today'
                : `${daysRemaining}d left`}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
