import { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
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
  const { t } = useTranslation('reviewer');
  const { colors } = useTheme();
  const { data: templates, isLoading: templatesLoading } = useRubrics();
  const { data: myScore, isLoading: scoreLoading } = useMyScore(councilId);
  const { mutate: submitScore, isPending } = useSubmitScore(councilId);

  const template = useMemo(
    () => templates?.find((t) => (t.templateType ?? '').toUpperCase() === (roundType ?? '').toUpperCase()),
    [templates, roundType],
  );

  const [scores, setScores] = useState<Record<string, number>>({});
  const [typedScores, setTypedScores] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [generalComments, setGeneralComments] = useState('');
  const [otherRecommendations, setOtherRecommendations] = useState('');

  useEffect(() => {
    if (!myScore?.scoreDetails) return;
    const nextScores: Record<string, number> = {};
    const nextComments: Record<string, string> = {};
    const nextTyped: Record<string, string> = {};
    myScore.scoreDetails.forEach((d) => {
      nextScores[d.criterionId] = d.givenScore;
      nextTyped[d.criterionId] = d.givenScore.toFixed(1);
      if (d.comments) nextComments[d.criterionId] = d.comments;
    });
    setScores(nextScores);
    setTypedScores(nextTyped);
    setComments(nextComments);
    setGeneralComments(myScore.generalComments ?? '');
    setOtherRecommendations(myScore.otherRecommendations ?? '');
  }, [myScore]);

  if (templatesLoading || scoreLoading) return <LoadingState message={t('scoringForm.loading')} />;

  if (roundStatus !== ROUND_STATUS.OPEN) {
    return (
      <EmptyState
        fullScreen={false}
        icon="🔒"
        title={t('scoringForm.notOpenTitle')}
        description={t('scoringForm.notOpenDescription')}
      />
    );
  }

  if (!template) {
    return (
      <EmptyState fullScreen={false} icon="⚠️" title={t('scoringForm.noRubricTitle')} description={t('scoringForm.noRubricDescription')} />
    );
  }

  const criteria = template.criteria ?? [];
  const total = criteria.reduce((sum, c) => sum + (scores[c.id] ?? 0), 0);
  const maxTotal = template.maxTotalScore ?? criteria.reduce((sum, c) => sum + c.maxScore, 0);

  function adjustScore(criterionId: string, max: number, delta: number) {
    setScores((prev) => {
      const current = prev[criterionId] ?? 0;
      const next = Math.min(max, Math.max(0, Math.round((current + delta) * 2) / 2));
      setTypedScores((tPrev) => ({ ...tPrev, [criterionId]: next.toFixed(1) }));
      return { ...prev, [criterionId]: next };
    });
  }

  function handleTextChange(criterionId: string, max: number, text: string) {
    let clean = text.replace(',', '.');
    const firstDotIdx = clean.indexOf('.');
    if (firstDotIdx !== -1) {
      clean = clean.substring(0, firstDotIdx + 1) + clean.substring(firstDotIdx + 1).replace(/\./g, '');
      const parts = clean.split('.');
      if (parts[1] && parts[1].length > 1) {
        clean = parts[0] + '.' + parts[1].substring(0, 1);
      }
    } else {
      clean = clean.replace(/[^\d]/g, '');
    }

    if (clean !== '') {
      const num = parseFloat(clean);
      if (num > max) {
        clean = max.toString();
      }
    }

    setTypedScores((prev) => ({ ...prev, [criterionId]: clean }));
    const parsed = parseFloat(clean);
    setScores((prev) => ({ ...prev, [criterionId]: isNaN(parsed) ? 0 : parsed }));
  }

  function handleBlur(criterionId: string) {
    setScores((prev) => {
      const val = prev[criterionId] ?? 0;
      setTypedScores((tPrev) => ({ ...tPrev, [criterionId]: val.toFixed(1) }));
      return prev;
    });
  }

  function handleSubmit() {
    if (!template) return;
    const missing = criteria.some((c) => scores[c.id] === undefined);
    if (missing) {
      Alert.alert(t('scoringForm.incompleteTitle'), t('scoringForm.incompleteMessage'));
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
        onSuccess: () => Alert.alert(t('scoringForm.savedTitle'), t('scoringForm.savedMessage')),
        onError: () => Alert.alert(t('scoringForm.errorTitle'), t('scoringForm.errorMessage')),
      },
    );
  }

  return (
    <View className="gap-4">
      {criteria.map((criterion) => (
        <GlassSurface key={criterion.id} rounded={24} className="p-4 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 text-neutral-900 dark:text-neutral-50 text-sm font-semibold pr-3">{criterion.criterionName}</Text>
            <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">/ {criterion.maxScore}</Text>
          </View>
          <View className="flex-row items-center justify-center gap-4">
            <TouchableOpacity onPress={() => adjustScore(criterion.id, criterion.maxScore, -0.5)} hitSlop={8}>
              <Ionicons name="remove-circle-outline" size={28} color={colors.accent.primary} />
            </TouchableOpacity>
            <TextInput
              keyboardType="decimal-pad"
              value={typedScores[criterion.id] ?? (scores[criterion.id] ?? 0).toFixed(1)}
              onChangeText={(text) => handleTextChange(criterion.id, criterion.maxScore, text)}
              onBlur={() => handleBlur(criterion.id)}
              className="text-neutral-900 dark:text-neutral-50 text-xl font-bold w-16 text-center p-1 border-b border-neutral-200 dark:border-dark-300"
            />
            <TouchableOpacity onPress={() => adjustScore(criterion.id, criterion.maxScore, 0.5)} hitSlop={8}>
              <Ionicons name="add-circle-outline" size={28} color={colors.accent.primary} />
            </TouchableOpacity>
          </View>
          <Input
            placeholder={t('scoringForm.commentsPlaceholder')}
            value={comments[criterion.id] ?? ''}
            onChangeText={(val) => setComments((prev) => ({ ...prev, [criterion.id]: val }))}
            multiline
          />
        </GlassSurface>
      ))}

      <View className="bg-violet-50 dark:bg-violet-900/10 rounded-2xl border border-violet-100 dark:border-violet-900/30 p-4 flex-row items-center justify-between">
        <Text className="text-violet-700 dark:text-violet-300 text-sm font-semibold">{t('scoringForm.totalScore')}</Text>
        <Text className="text-violet-700 dark:text-violet-300 text-lg font-bold">
          {total.toFixed(1)} / {maxTotal}
        </Text>
      </View>

      <Input label={t('scoringForm.generalComments')} value={generalComments} onChangeText={setGeneralComments} multiline numberOfLines={3} />
      <Input label={t('scoringForm.otherRecommendations')} value={otherRecommendations} onChangeText={setOtherRecommendations} multiline numberOfLines={3} />

      <Button label={myScore ? t('scoringForm.updateScore') : t('scoringForm.submitScore')} onPress={handleSubmit} loading={isPending} fullWidth />
    </View>
  );
}
