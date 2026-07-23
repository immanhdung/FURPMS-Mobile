import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { useAcceptance, useSubmitAcceptance } from '@/features/reviewCommittee/hooks/useAcceptance';
import { ACCEPTANCE_RESULTS, ROUND_STATUS, type AcceptanceResult } from '@/constants/statuses';

interface AcceptanceEvaluationFormProps {
  councilId: string;
  roundStatus?: string | null;
}

export function AcceptanceEvaluationForm({ councilId, roundStatus }: AcceptanceEvaluationFormProps) {
  const { data: acceptance, isLoading } = useAcceptance(councilId);
  const { mutate: submit, isPending } = useSubmitAcceptance(councilId);

  const [result, setResult] = useState<AcceptanceResult>('PASS');
  const [failReason, setFailReason] = useState('');

  useEffect(() => {
    if (!acceptance) return;
    setResult(acceptance.result);
    setFailReason(acceptance.failReason ?? '');
  }, [acceptance]);

  if (isLoading) return <LoadingState message="Loading acceptance evaluation…" />;

  if (roundStatus !== ROUND_STATUS.OPEN) {
    return <EmptyState fullScreen={false} icon="🔒" title="Not open" description="This acceptance round isn't open right now." />;
  }

  function handleSubmit() {
    if (result === 'FAIL' && !failReason.trim()) {
      Alert.alert('Reason required', 'Please explain why this proposal failed acceptance.');
      return;
    }
    submit(
      { result, failReason: result === 'FAIL' ? failReason.trim() : undefined },
      {
        onSuccess: () => Alert.alert('Saved', 'Your acceptance evaluation has been submitted.'),
        onError: () => Alert.alert('Error', 'Failed to submit. Please try again.'),
      },
    );
  }

  return (
    <View className="gap-4">
      <View className="flex-row gap-2">
        {ACCEPTANCE_RESULTS.map((opt) => {
          const selected = result === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => setResult(opt)}
              activeOpacity={0.7}
              className={`flex-1 items-center py-4 rounded-xl border ${
                selected
                  ? opt === 'PASS'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-neutral-200 dark:border-dark-200 bg-white dark:bg-dark-50'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selected ? (opt === 'PASS' ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300') : 'text-neutral-900 dark:text-neutral-50'
                }`}
              >
                {opt === 'PASS' ? 'Pass' : 'Fail'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {result === 'FAIL' && (
        <Input label="Fail reason" required value={failReason} onChangeText={setFailReason} multiline numberOfLines={4} />
      )}

      <Button label={acceptance ? 'Update Evaluation' : 'Submit Evaluation'} onPress={handleSubmit} loading={isPending} fullWidth />
    </View>
  );
}
