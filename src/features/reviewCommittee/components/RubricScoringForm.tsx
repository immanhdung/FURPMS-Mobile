import { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { useRubrics, useMyScore, useSubmitScore } from '@/features/reviewCommittee/hooks/useReviewScoring';
import { ROUND_STATUS } from '@/constants/statuses';

interface RubricScoringFormProps {
  councilId: string;
  roundType?: string | null;
  roundStatus?: string | null;
}

export function RubricScoringForm({ councilId, roundType, roundStatus }: RubricScoringFormProps) {
  const { colors } = useTheme();
  const { data: templates, isLoading: templatesLoading } = useRubrics();
  const { data: myScore, isLoading: scoreLoading } = useMyScore(councilId);
  const { mutate: submitScore, isPending } = useSubmitScore(councilId);

  const template = useMemo(
    () => templates?.find((t) => (t.templateType ?? '').toUpperCase() === (roundType ?? '').toUpperCase()),
    [templates, roundType],
  );

  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [generalComments, setGeneralComments] = useState('');
  const [otherRecommendations, setOtherRecommendations] = useState('');

  useEffect(() => {
    if (!myScore?.scoreDetails) return;
    const nextScores: Record<string, number> = {};
    const nextComments: Record<string, string> = {};
    myScore.scoreDetails.forEach((d) => {
      nextScores[d.criterionId] = d.givenScore;
      if (d.comments) nextComments[d.criterionId] = d.comments;
    });
    setScores(nextScores);
    setComments(nextComments);
    setGeneralComments(myScore.generalComments ?? '');
    setOtherRecommendations(myScore.otherRecommendations ?? '');
  }, [myScore]);

  if (templatesLoading || scoreLoading) return <LoadingState message="Loading scoring form…" />;

  if (roundStatus !== ROUND_STATUS.OPEN) {
    return (
      <EmptyState
        fullScreen={false}
        icon="🔒"
        title="Scoring not open"
        description="This review round isn't open for scoring right now."
      />
    );
  }

  if (!template) {
    return (
      <EmptyState fullScreen={false} icon="⚠️" title="No rubric found" description="No scoring rubric is configured for this round type." />
    );
  }

  const criteria = template.criteria ?? [];
  const total = criteria.reduce((sum, c) => sum + (scores[c.id] ?? 0), 0);
  const maxTotal = template.maxTotalScore ?? criteria.reduce((sum, c) => sum + c.maxScore, 0);

  function adjustScore(criterionId: string, max: number, delta: number) {
    setScores((prev) => {
      const current = prev[criterionId] ?? 0;
      const next = Math.min(max, Math.max(0, Math.round((current + delta) * 2) / 2));
      return { ...prev, [criterionId]: next };
    });
  }

  function handleSubmit() {
    if (!template) return;
    const missing = criteria.some((c) => scores[c.id] === undefined);
    if (missing) {
      Alert.alert('Incomplete', 'Please score every criterion before submitting.');
      return;
    }
    submitScore(
      {
        templateId: template.id,
        generalComments: generalComments || undefined,
        otherRecommendations: otherRecommendations || undefined,
        scoreDetails: criteria.map((c) => ({
          criterionId: c.id,
          givenScore: scores[c.id] ?? 0,
          comments: comments[c.id] || undefined,
        })),
      },
      {
        onSuccess: () => Alert.alert('Saved', 'Your score has been submitted.'),
        onError: () => Alert.alert('Error', 'Failed to submit score. Please try again.'),
      },
    );
  }

  return (
    <View className="gap-4">
      {criteria.map((criterion) => (
        <View key={criterion.id} className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 text-neutral-900 dark:text-neutral-50 text-sm font-semibold pr-3">{criterion.criterionName}</Text>
            <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">/ {criterion.maxScore}</Text>
          </View>
          <View className="flex-row items-center justify-center gap-4">
            <TouchableOpacity onPress={() => adjustScore(criterion.id, criterion.maxScore, -0.5)} hitSlop={8}>
              <Ionicons name="remove-circle-outline" size={28} color={colors.accent.primary} />
            </TouchableOpacity>
            <Text className="text-neutral-900 dark:text-neutral-50 text-xl font-bold w-16 text-center">
              {(scores[criterion.id] ?? 0).toFixed(1)}
            </Text>
            <TouchableOpacity onPress={() => adjustScore(criterion.id, criterion.maxScore, 0.5)} hitSlop={8}>
              <Ionicons name="add-circle-outline" size={28} color={colors.accent.primary} />
            </TouchableOpacity>
          </View>
          <Input
            placeholder="Comments (optional)"
            value={comments[criterion.id] ?? ''}
            onChangeText={(t) => setComments((prev) => ({ ...prev, [criterion.id]: t }))}
            multiline
          />
        </View>
      ))}

      <View className="bg-violet-50 dark:bg-violet-900/10 rounded-2xl border border-violet-100 dark:border-violet-900/30 p-4 flex-row items-center justify-between">
        <Text className="text-violet-700 dark:text-violet-300 text-sm font-semibold">Total Score</Text>
        <Text className="text-violet-700 dark:text-violet-300 text-lg font-bold">
          {total.toFixed(1)} / {maxTotal}
        </Text>
      </View>

      <Input label="General comments" value={generalComments} onChangeText={setGeneralComments} multiline numberOfLines={3} />
      <Input label="Other recommendations" value={otherRecommendations} onChangeText={setOtherRecommendations} multiline numberOfLines={3} />

      <Button label={myScore ? 'Update Score' : 'Submit Score'} onPress={handleSubmit} loading={isPending} fullWidth />
    </View>
  );
}
