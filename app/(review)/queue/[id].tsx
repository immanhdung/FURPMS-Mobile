import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useMyMemberships } from '@/features/reviewCommittee/hooks/useMemberships';
import { useCouncilMeetings } from '@/features/meeting/hooks/useMeetings';
import { Badge } from '@/shared/components/ui/Badge';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { ProposalDocumentViewer } from '@/features/reviewCommittee/components/ProposalDocumentViewer';
import { RubricScoringForm } from '@/features/reviewCommittee/components/RubricScoringForm';
import { AcceptanceEvaluationForm } from '@/features/reviewCommittee/components/AcceptanceEvaluationForm';
import { MinutesPanel } from '@/features/reviewCommittee/components/MinutesPanel';
import { formatDateTime } from '@/utils/date';
import { REVIEW_ROUND_TYPE, isSecretaryRole, ROUND_TYPE_LABELS, type ReviewRoundType } from '@/constants/statuses';

type Tab = 'DOCUMENTS' | 'SCORING' | 'ACCEPTANCE' | 'MINUTES';

export default function CouncilWorkspaceScreen() {
  const { t } = useTranslation('reviewer');
  const { id: councilId } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const { data: memberships, isLoading, isError, refetch } = useMyMemberships();
  const { data: meetings } = useCouncilMeetings(councilId);

  const membership = useMemo(() => memberships?.find((m) => m.councilId === councilId), [memberships, councilId]);

  const isSecretary = isSecretaryRole(membership?.memberRole);
  const isAcceptanceRound = membership?.roundType === REVIEW_ROUND_TYPE.ACCEPTANCE;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'DOCUMENTS', label: t('workspace.tabs.documents') },
    ...(!isSecretary ? [{ key: 'SCORING' as Tab, label: t('workspace.tabs.scoring') }] : []),
    ...(isAcceptanceRound ? [{ key: 'ACCEPTANCE' as Tab, label: t('workspace.tabs.acceptance') }] : []),
    { key: 'MINUTES', label: t('workspace.tabs.minutes') },
  ];

  const [tab, setTab] = useState<Tab>('DOCUMENTS');
  const activeTab = tabs.some((tabItem) => tabItem.key === tab) ? tab : tabs[0].key;

  if (isLoading) return <LoadingState message={t('workspace.loading')} />;
  if (isError) return <ErrorState title={t('workspace.errorTitle')} message={t('workspace.errorMessage')} onRetry={refetch} />;
  if (!membership) return <ErrorState title={t('workspace.notFoundTitle')} message={t('workspace.notFoundMessage')} onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0" edges={['bottom']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-4 gap-3">
          <Text className="text-neutral-900 dark:text-neutral-50 text-xl font-bold leading-snug">
            {membership.proposalTitleVI || t('workspace.untitledProposal')}
          </Text>
          <View className="flex-row items-center gap-2 flex-wrap">
            {membership.roundType && (
              <Badge label={ROUND_TYPE_LABELS[membership.roundType as ReviewRoundType] ?? membership.roundType} variant="purple" size="sm" />
            )}
            {membership.memberRole && <Badge label={membership.memberRole} variant="info" size="sm" />}
            {membership.roundStatus && <Badge label={membership.roundStatus} variant="default" size="sm" />}
            {membership.proposalStatus && <Badge label={membership.proposalStatus} variant="default" size="sm" />}
          </View>
        </View>

        {/* Meetings */}
        {meetings && meetings.length > 0 && (
          <View className="px-5 mb-4 gap-2">
            {meetings.map((m) => (
              <GlassSurface key={m.id} rounded={24} className="p-4 gap-1.5">
                <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">{m.title || t('workspace.councilMeeting')}</Text>
                <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{formatDateTime(m.scheduledAt)}</Text>
                {m.meetingLink && (
                  <TouchableOpacity onPress={() => Linking.openURL(m.meetingLink!)} activeOpacity={0.7} className="flex-row items-center gap-1.5 mt-1">
                    <Ionicons name="videocam-outline" size={14} color={colors.accent.primary} />
                    <Text className="text-violet-600 dark:text-violet-400 text-xs font-medium">{t('workspace.joinMeeting')}</Text>
                  </TouchableOpacity>
                )}
              </GlassSurface>
            ))}
          </View>
        )}

        {/* Tabs */}
        <View className="flex-row gap-2 px-5 mb-4">
          {tabs.map((tabItem) => {
            const active = tabItem.key === activeTab;
            return active ? (
              <TouchableOpacity
                key={tabItem.key}
                onPress={() => setTab(tabItem.key)}
                activeOpacity={0.7}
                className="flex-1 items-center py-2.5 rounded-xl bg-violet-500 dark:bg-violet-600"
              >
                <Text className="text-xs font-medium text-white">{tabItem.label}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity key={tabItem.key} onPress={() => setTab(tabItem.key)} activeOpacity={0.7} className="flex-1">
                <GlassSurface rounded={12} className="items-center py-2.5">
                  <Text className="text-xs font-medium text-neutral-700 dark:text-neutral-200">{tabItem.label}</Text>
                </GlassSurface>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="px-5">
          {activeTab === 'DOCUMENTS' && <ProposalDocumentViewer proposalId={membership.proposalId} />}
          {activeTab === 'SCORING' && (
            <RubricScoringForm councilId={councilId} roundType={membership.roundType} roundStatus={membership.roundStatus} />
          )}
          {activeTab === 'ACCEPTANCE' && <AcceptanceEvaluationForm councilId={councilId} roundStatus={membership.roundStatus} />}
          {activeTab === 'MINUTES' && (
            <MinutesPanel councilId={councilId} projectId={membership.projectId} memberRole={membership.memberRole} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
