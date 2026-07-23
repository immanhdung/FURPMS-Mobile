import { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
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
    return councilMembers?.find((m) => m.userId === userId)?.reviewerName ?? fallback ?? 'Reviewer';
  }

  function handleSaveDraft() {
    saveMinutes(
      { projectId: projectId ?? undefined, result, councilComments: councilComments || undefined, recommendations: recommendations || undefined },
      {
        onSuccess: () => Alert.alert('Saved', 'Minutes draft has been saved.'),
        onError: () => Alert.alert('Error', 'Failed to save minutes. Please try again.'),
      },
    );
  }

  function handleApprove() {
    Alert.alert(
      'Approve & Lock Minutes',
      'This finalizes the council decision and changes the proposal status. This cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Lock',
          style: 'destructive',
          onPress: () =>
            approveMinutes(undefined, {
              onError: () => Alert.alert('Error', 'Failed to approve minutes. Please try again.'),
            }),
        },
      ],
    );
  }

  if (decisionLoading) return <LoadingState message="Loading minutes…" />;

  return (
    <View className="gap-4">
      {/* Tally */}
      <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4">
        <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mb-3">Reference only</Text>
        <View className="flex-row">
          <StatBox label="Total Members" value={decision?.totalMembers ?? '—'} />
          <StatBox label="Attending" value={decision?.attendingMembers ?? '—'} />
          <StatBox label="Valid Ballots" value={decision?.validBallots ?? '—'} />
          <StatBox label="Avg. Score" value={decision?.averageScore?.toFixed(1) ?? '—'} />
        </View>
      </View>

      {/* All scores */}
      <View>
        <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold mb-2">Reviewer Scores</Text>
        {scoresLoading ? (
          <LoadingState message="Loading scores…" />
        ) : allScores?.forbidden ? (
          <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans italic">Not permitted to view.</Text>
        ) : allScores && allScores.scores.length > 0 ? (
          <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 overflow-hidden">
            {allScores.scores.map((s, i) => (
              <View key={s.id}>
                {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-4" />}
                <View className="flex-row items-center justify-between px-4 py-3">
                  <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">{nameFor(s.reviewerId, s.reviewerName)}</Text>
                  <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold">{s.totalScore?.toFixed(1) ?? '—'}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans">No scores submitted yet.</Text>
        )}
      </View>

      {/* Feedback */}
      <View>
        <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold mb-2">Feedback</Text>
        {feedbackLoading ? (
          <LoadingState message="Loading feedback…" />
        ) : feedback?.forbidden ? (
          <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans italic">Not permitted to view.</Text>
        ) : feedback && feedback.feedback.length > 0 ? (
          <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 overflow-hidden">
            {feedback.feedback.map((f, i) => (
              <View key={f.id}>
                {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-4" />}
                <View className="px-4 py-3">
                  <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">{nameFor(f.reviewerId, f.reviewerName)}</Text>
                  {f.comments && <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mt-0.5">{f.comments}</Text>}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans">No feedback yet.</Text>
        )}
      </View>

      {/* Minutes body */}
      {secretary && !locked ? (
        <View className="gap-3">
          <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold">Draft Minutes</Text>
          <Input label="Result" value={result} onChangeText={setResult} placeholder="APPROVED / REJECTED / REVISION_REQUIRED" autoCapitalize="characters" />
          <Input label="Council comments" value={councilComments} onChangeText={setCouncilComments} multiline numberOfLines={4} />
          <Input label="Recommendations" value={recommendations} onChangeText={setRecommendations} multiline numberOfLines={3} />
          <Button label={decision ? 'Update Draft' : 'Save Draft'} variant="secondary" onPress={handleSaveDraft} loading={isSaving} fullWidth />
        </View>
      ) : decision ? (
        <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold">Minutes</Text>
            <Text className={`text-xs font-semibold ${locked ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {locked ? 'Locked' : 'Draft'}
            </Text>
          </View>
          {decision.result && <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">Result: {decision.result}</Text>}
          {decision.councilComments && <Text className="text-neutral-600 dark:text-dark-400 text-sm font-sans leading-relaxed">{decision.councilComments}</Text>}
          {decision.recommendations && (
            <View className="bg-neutral-50 dark:bg-dark-100 rounded-xl p-3">
              <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mb-1">Recommendations</Text>
              <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-sans leading-relaxed">{decision.recommendations}</Text>
            </View>
          )}
        </View>
      ) : (
        <EmptyState fullScreen={false} icon="🗒️" title="No minutes yet" description="The council secretary hasn't drafted minutes for this proposal yet." />
      )}

      {chairman && decision && !locked && (
        <Button label={isApproving ? 'Approving…' : 'Approve & Lock'} variant="danger" onPress={handleApprove} loading={isApproving} fullWidth />
      )}
    </View>
  );
}
