import { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useMeeting } from '@/features/meeting/hooks/useMeetings';
import { Badge } from '@/shared/components/ui/Badge';
import { Avatar } from '@/shared/components/ui/Avatar';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { formatDateTime, formatDuration } from '@/utils/date';
import type { BadgeVariant } from '@/shared/components/ui/Badge';
import type { MeetingType, MeetingStatus } from '@/features/meeting/types/meeting.types';

const typeVariant: Record<MeetingType, BadgeVariant> = {
  REVIEW: 'purple',
  DISCUSSION: 'info',
  GENERAL: 'default',
};

const typeLabel: Record<MeetingType, string> = {
  REVIEW: 'Review Panel',
  DISCUSSION: 'Discussion',
  GENERAL: 'General Meeting',
};

const statusConfig: Record<MeetingStatus, { label: string; variant: BadgeVariant }> = {
  UPCOMING: { label: 'Upcoming', variant: 'info' },
  IN_PROGRESS: { label: 'In Progress', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'default' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
};

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 overflow-hidden">
      {children}
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-neutral-900 dark:text-neutral-50 text-base font-semibold mb-3">
      {title}
    </Text>
  );
}

export default function ReviewMeetingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { data: meeting, isLoading, isError, refetch } = useMeeting(id);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (isLoading) return <LoadingState message="Loading meeting…" />;
  if (isError || !meeting)
    return (
      <ErrorState
        title="Could not load meeting"
        message="Check your connection and try again."
        onRetry={refetch}
      />
    );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
            colors={[colors.accent.primary]}
          />
        }
      >
        {/* Hero */}
        <View className="mb-5 gap-3">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Badge label={typeLabel[meeting.type]} variant={typeVariant[meeting.type]} size="md" />
            <Badge
              label={statusConfig[meeting.status].label}
              variant={statusConfig[meeting.status].variant}
              size="md"
            />
          </View>
          <Text className="text-neutral-900 dark:text-neutral-50 text-xl font-bold leading-snug">
            {meeting.title}
          </Text>
          {meeting.linkedProposalTitle && (
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="link-outline" size={14} color={colors.icon.accent} />
              <Text
                className="text-violet-600 dark:text-violet-400 text-sm font-medium"
                numberOfLines={1}
              >
                {meeting.linkedProposalTitle}
              </Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View className="mb-5">
          <SectionHeader title="Meeting Details" />
          <SectionCard>
            <View className="p-4 gap-3">
              <View className="flex-row items-center gap-3">
                <View className="bg-violet-100 dark:bg-violet-900/30 w-9 h-9 rounded-xl items-center justify-center">
                  <Ionicons name="calendar" size={18} color={colors.accent.primary} />
                </View>
                <View>
                  <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                    Date & Time
                  </Text>
                  <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">
                    {formatDateTime(meeting.scheduledAt)}
                  </Text>
                </View>
              </View>

              <View className="h-px bg-neutral-100 dark:bg-dark-200" />

              <View className="flex-row items-center gap-3">
                <View className="bg-amber-100 dark:bg-amber-900/30 w-9 h-9 rounded-xl items-center justify-center">
                  <Ionicons name="hourglass" size={18} color={colors.accent.warning} />
                </View>
                <View>
                  <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                    Duration
                  </Text>
                  <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">
                    {formatDuration(meeting.durationMinutes)}
                  </Text>
                </View>
              </View>

              {meeting.location ? (
                <>
                  <View className="h-px bg-neutral-100 dark:bg-dark-200" />
                  <View className="flex-row items-center gap-3">
                    <View className="bg-blue-100 dark:bg-blue-900/30 w-9 h-9 rounded-xl items-center justify-center">
                      <Ionicons name="location" size={18} color={colors.accent.info} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                        Location
                      </Text>
                      <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">
                        {meeting.location}
                      </Text>
                    </View>
                  </View>
                </>
              ) : null}

              {meeting.videoLink ? (
                <>
                  <View className="h-px bg-neutral-100 dark:bg-dark-200" />
                  <TouchableOpacity
                    className="flex-row items-center gap-3"
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(meeting.videoLink!)}
                  >
                    <View className="bg-emerald-100 dark:bg-emerald-900/30 w-9 h-9 rounded-xl items-center justify-center">
                      <Ionicons name="videocam" size={18} color={colors.accent.success} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                        Video Link
                      </Text>
                      <Text className="text-violet-600 dark:text-violet-400 text-sm font-medium">
                        Join online meeting
                      </Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color={colors.icon.muted} />
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          </SectionCard>
        </View>

        {/* Participants */}
        {meeting.participants.length > 0 && (
          <View className="mb-5">
            <SectionHeader title={`Participants (${meeting.participants.length})`} />
            <SectionCard>
              {meeting.participants.map((p, i) => (
                <View key={p.id}>
                  {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-4" />}
                  <View className="flex-row items-center gap-3 px-4 py-3">
                    <Avatar name={p.name} size="sm" />
                    <View className="flex-1">
                      <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">
                        {p.name}
                      </Text>
                      <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                        {p.role}
                      </Text>
                    </View>
                    {p.attended !== undefined && (
                      <Ionicons
                        name={p.attended ? 'checkmark-circle' : 'ellipse-outline'}
                        size={18}
                        color={p.attended ? colors.accent.success : colors.icon.muted}
                      />
                    )}
                  </View>
                </View>
              ))}
            </SectionCard>
          </View>
        )}

        {/* Agenda */}
        {meeting.agenda.length > 0 && (
          <View className="mb-5">
            <SectionHeader title="Agenda" />
            <SectionCard>
              {meeting.agenda.map((item, i) => (
                <View key={item.id}>
                  {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-4" />}
                  <View className="flex-row items-start gap-3 px-4 py-3">
                    <View className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 items-center justify-center mt-0.5 flex-shrink-0">
                      <Text className="text-violet-700 dark:text-violet-300 text-xs font-bold">
                        {item.order}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">
                        {item.title}
                      </Text>
                      <View className="flex-row items-center gap-3 mt-0.5">
                        {item.presenter && (
                          <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                            {item.presenter}
                          </Text>
                        )}
                        {item.durationMinutes && (
                          <Text className="text-neutral-400 dark:text-dark-400 text-xs font-sans">
                            {formatDuration(item.durationMinutes)}
                          </Text>
                        )}
                      </View>
                      {item.description ? (
                        <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mt-1 leading-relaxed">
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              ))}
            </SectionCard>
          </View>
        )}

        {/* Minutes */}
        {meeting.minutes ? (
          <View className="mb-5">
            <SectionHeader title="Meeting Minutes" />
            <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4">
              <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-sans leading-relaxed">
                {meeting.minutes}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
