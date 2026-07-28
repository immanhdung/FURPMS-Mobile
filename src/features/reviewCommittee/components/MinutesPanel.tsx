import { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { useDecision, useSaveMinutes, useApproveMinutes } from '@/features/reviewCommittee/hooks/useDecision';
import { useAllScores } from '@/features/reviewCommittee/hooks/useReviewScoring';
import { useFeedback } from '@/features/reviewCommittee/hooks/useFeedback';
import { useCouncilMembers } from '@/features/reviewCommittee/hooks/useCouncilMembers';
import { isChairmanRole, isSecretaryRole } from '@/constants/statuses';

interface MinutesPanelProps {
  councilId: string;
  projectId?: string | null;
  memberRole?: string | null;
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-1 items-center gap-1">
      <Text className="text-neutral-900 dark:text-neutral-50 text-lg font-bold">{value}</Text>
      <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans text-center">{label}</Text>
    </View>
  );
}

export function MinutesPanel({ councilId, projectId, memberRole }: MinutesPanelProps) {
  const { t } = useTranslation(['reviewer', 'common']);
  const { data: decision, isLoading: decisionLoading } = useDecision(councilId);
  const { data: allScores, isLoading: scoresLoading } = useAllScores(councilId);
  const { data: feedback, isLoading: feedbackLoading } = useFeedback(councilId);
  const { data: councilMembers } = useCouncilMembers(councilId);

  const { mutate: saveMinutes, isPending: isSaving } = useSaveMinutes(councilId);
  const { mutate: approveMinutes, isPending: isApproving } = useApproveMinutes(councilId);

  const secretary = isSecretaryRole(memberRole);
  const chairman = isChairmanRole(memberRole);
  const locked = !!decision?.finalizedAt;

  const [result, setResult] = useState('APPROVED');
  const [councilComments, setCouncilComments] = useState('');
  const [recommendations, setRecommendations] = useState('');

  useEffect(() => {
    if (!decision) return;
    if (decision.result) setResult(decision.result);
    setCouncilComments(decision.councilComments ?? '');
    setRecommendations(decision.recommendations ?? '');
  }, [decision]);

  function nameFor(userId?: string | null, fallback?: string | null) {
    return councilMembers?.find((m) => m.userId === userId)?.reviewerName ?? fallback ?? t('minutesPanel.defaultReviewer');
  }

  function handleSaveDraft() {
    saveMinutes(
      { projectId: projectId ?? undefined, result, councilComments: councilComments || undefined, recommendations: recommendations || undefined },
      {
        onSuccess: () => Alert.alert(t('minutesPanel.savedTitle'), t('minutesPanel.savedMessage')),
        onError: () => Alert.alert(t('minutesPanel.errorTitle'), t('minutesPanel.errorMessage')),
      },
    );
  }

  function handleApprove() {
    Alert.alert(
      t('minutesPanel.approveDialogTitle'),
      t('minutesPanel.approveDialogMessage'),
      [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('minutesPanel.approveAndLock'),
          style: 'destructive',
          onPress: () =>
            approveMinutes(undefined, {
              onError: () => Alert.alert(t('minutesPanel.errorTitle'), t('minutesPanel.approveErrorMessage')),
            }),
        },
      ],
    );
  }

  if (decisionLoading) return <LoadingState message={t('minutesPanel.loading')} />;

  return (
    <View className="gap-4">
      {/* Tally */}
      <GlassSurface rounded={24} className="p-4">
        <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mb-3">{t('minutesPanel.referenceOnly')}</Text>
        <View className="flex-row">
          <StatBox label={t('minutesPanel.totalMembers')} value={decision?.totalMembers ?? '—'} />
          <StatBox label={t('minutesPanel.attending')} value={decision?.attendingMembers ?? '—'} />
          <StatBox label={t('minutesPanel.validBallots')} value={decision?.validBallots ?? '—'} />
          <StatBox label={t('minutesPanel.avgScore')} value={decision?.averageScore?.toFixed(1) ?? '—'} />
        </View>
      </GlassSurface>

      {/* All scores */}
      <View>
        <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold mb-2">{t('minutesPanel.reviewerScores')}</Text>
        {scoresLoading ? (
          <LoadingState message={t('minutesPanel.loadingScores')} />
        ) : allScores?.forbidden ? (
          <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans italic">{t('minutesPanel.notPermitted')}</Text>
        ) : allScores && allScores.scores.length > 0 ? (
          <GlassSurface rounded={24}>
            {allScores.scores.map((s, i) => (
              <View key={s.id}>
                {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-4" />}
                <View className="flex-row items-center justify-between px-4 py-3">
                  <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">{nameFor(s.reviewerId, s.reviewerName)}</Text>
                  <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold">{s.totalScore?.toFixed(1) ?? '—'}</Text>
                </View>
              </View>
            ))}
          </GlassSurface>
        ) : (
          <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans">{t('minutesPanel.noScores')}</Text>
        )}
      </View>

      {/* Feedback */}
      <View>
        <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold mb-2">{t('minutesPanel.feedback')}</Text>
        {feedbackLoading ? (
          <LoadingState message={t('minutesPanel.loadingFeedback')} />
        ) : feedback?.forbidden ? (
          <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans italic">{t('minutesPanel.notPermitted')}</Text>
        ) : feedback && feedback.feedback.length > 0 ? (
          <GlassSurface rounded={24}>
            {feedback.feedback.map((f, i) => (
              <View key={f.id}>
                {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-4" />}
                <View className="px-4 py-3">
                  <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">{nameFor(f.reviewerId, f.reviewerName)}</Text>
                  {f.comments && <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mt-0.5">{f.comments}</Text>}
                </View>
              </View>
            ))}
          </GlassSurface>
        ) : (
          <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans">{t('minutesPanel.noFeedback')}</Text>
        )}
      </View>

      {/* Minutes body */}
      {secretary && !locked ? (
        <View className="gap-3">
          <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold">{t('minutesPanel.draftMinutes')}</Text>
          <Input label={t('minutesPanel.resultLabel')} value={result} onChangeText={setResult} placeholder={t('minutesPanel.resultPlaceholder')} autoCapitalize="characters" />
          <Input label={t('minutesPanel.councilComments')} value={councilComments} onChangeText={setCouncilComments} multiline numberOfLines={4} />
          <Input label={t('minutesPanel.recommendations')} value={recommendations} onChangeText={setRecommendations} multiline numberOfLines={3} />
          <Button label={decision ? t('minutesPanel.updateDraft') : t('minutesPanel.saveDraft')} variant="secondary" onPress={handleSaveDraft} loading={isSaving} fullWidth />
        </View>
      ) : decision ? (
        <GlassSurface rounded={24} className="p-4 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold">{t('minutesPanel.minutes')}</Text>
            <Text className={`text-xs font-semibold ${locked ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {locked ? t('minutesPanel.locked') : t('minutesPanel.draft')}
            </Text>
          </View>
          {decision.result && <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">{t('minutesPanel.resultPrefix', { result: decision.result })}</Text>}
          {decision.councilComments && <Text className="text-neutral-600 dark:text-dark-400 text-sm font-sans leading-relaxed">{decision.councilComments}</Text>}
          {decision.recommendations && (
            <View className="bg-neutral-50 dark:bg-dark-100 rounded-xl p-3">
              <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mb-1">{t('minutesPanel.recommendations')}</Text>
              <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-sans leading-relaxed">{decision.recommendations}</Text>
            </View>
          )}
        </GlassSurface>
      ) : (
        <EmptyState fullScreen={false} icon="🗒️" title={t('minutesPanel.noMinutesTitle')} description={t('minutesPanel.noMinutesDescription')} />
      )}

      {chairman && decision && !locked && (
        <Button label={isApproving ? t('minutesPanel.approving') : t('minutesPanel.approveAndLock')} variant="danger" onPress={handleApprove} loading={isApproving} fullWidth />
      )}
    </View>
  );
}
