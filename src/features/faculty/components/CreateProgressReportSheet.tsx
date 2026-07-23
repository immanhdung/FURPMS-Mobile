import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useCreateProgressReport, useSubmitProgressReport } from '@/features/faculty/hooks/useProgressReports';

interface CreateProgressReportSheetProps {
  visible: boolean;
  contractId: string;
  onClose: () => void;
}

export function CreateProgressReportSheet({ visible, contractId, onClose }: CreateProgressReportSheetProps) {
  const { colors } = useTheme();
  const { mutate: create, isPending: isCreating } = useCreateProgressReport(contractId);
  const { mutate: submit, isPending: isSubmitting } = useSubmitProgressReport(contractId);

  const [period, setPeriod] = useState('');
  const [completedContent, setCompletedContent] = useState('');
  const [pendingContent, setPendingContent] = useState('');
  const [overallCompletionPct, setOverallCompletionPct] = useState('');
  const [nextPeriodPlan, setNextPeriodPlan] = useState('');

  const isPending = isCreating || isSubmitting;

  function reset() {
    setPeriod('');
    setCompletedContent('');
    setPendingContent('');
    setOverallCompletionPct('');
    setNextPeriodPlan('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  // The backend has no PATCH-content endpoint for progress reports — create and submit happen
  // together in one action, mirroring web's CreateProgressReportSheet.
  function handleSubmit() {
    create(
      {
        period: period || undefined,
        completedContent: completedContent || undefined,
        pendingContent: pendingContent || undefined,
        overallCompletionPct: overallCompletionPct ? Number(overallCompletionPct) : undefined,
        nextPeriodPlan: nextPeriodPlan || undefined,
      },
      {
        onSuccess: (report) => {
          submit(report.id, {
            onSuccess: handleClose,
            onError: () => Alert.alert('Error', 'Report was saved but could not be submitted. Try submitting it again.'),
          });
        },
        onError: () => Alert.alert('Error', 'Failed to create progress report. Please try again.'),
      },
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/40">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="bg-white dark:bg-dark-50 rounded-t-3xl px-5 pt-5 pb-8 gap-4 max-h-[85%]">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">New Progress Report</Text>
              <TouchableOpacity onPress={handleClose} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.icon.muted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <Input label="Period" placeholder="e.g. Q1 2026" value={period} onChangeText={setPeriod} />
                <Input label="Completed content" value={completedContent} onChangeText={setCompletedContent} multiline numberOfLines={3} />
                <Input label="Pending content" value={pendingContent} onChangeText={setPendingContent} multiline numberOfLines={3} />
                <Input
                  label="Overall completion (%)"
                  value={overallCompletionPct}
                  onChangeText={(t) => setOverallCompletionPct(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
                <Input label="Next period plan" value={nextPeriodPlan} onChangeText={setNextPeriodPlan} multiline numberOfLines={3} />
                <Button label="Create & Submit" onPress={handleSubmit} loading={isPending} fullWidth />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
