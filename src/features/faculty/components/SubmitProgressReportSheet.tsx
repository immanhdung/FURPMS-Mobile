import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { useUpdateProgressReport, useSubmitProgressReport, useProgressReportDetail } from '@/features/faculty/hooks/useProgressReports';
import type { ProgressReport } from '@/features/faculty/types/progress-report.types';
import { formatDate } from '@/utils/date';

interface SubmitProgressReportSheetProps {
  contractId: string;
  report: ProgressReport | null;
  onClose: () => void;
}

// The report slot itself (period, due date) is scheduled by staff on the web app — this sheet
// only lets the PI fill in and submit content for a slot that already exists.
export function SubmitProgressReportSheet({ contractId, report, onClose }: SubmitProgressReportSheetProps) {
  const { t } = useTranslation(['faculty', 'common']);
  const { colors } = useTheme();
  const { data: detail } = useProgressReportDetail(report?.id);
  const { mutate: update, isPending: isUpdating } = useUpdateProgressReport(contractId);
  const { mutate: submit, isPending: isSubmitting } = useSubmitProgressReport(contractId);

  const [completedContent, setCompletedContent] = useState('');
  const [pendingContent, setPendingContent] = useState('');
  const [overallCompletionPct, setOverallCompletionPct] = useState('');
  const [nextPeriodPlan, setNextPeriodPlan] = useState('');

  const isPending = isUpdating || isSubmitting;

  useEffect(() => {
    if (!report) return;
    setCompletedContent(detail?.completedContent ?? '');
    setPendingContent(detail?.pendingContent ?? '');
    setOverallCompletionPct(report.overallCompletionPct != null ? String(report.overallCompletionPct) : '');
    setNextPeriodPlan(detail?.nextPeriodPlan ?? '');
  }, [report, detail]);

  function handleClose() {
    onClose();
  }

  function handleSubmit() {
    if (!report) return;
    update(
      {
        id: report.id,
        payload: {
          completedContent: completedContent || undefined,
          pendingContent: pendingContent || undefined,
          overallCompletionPct: overallCompletionPct ? Number(overallCompletionPct) : undefined,
          nextPeriodPlan: nextPeriodPlan || undefined,
          expenditureToDate: detail?.expenditureToDate ?? undefined,
          piRecommendations: detail?.piRecommendations ?? undefined,
          reportFileUrl: detail?.reportFileUrl ?? undefined,
          items: detail?.items?.map((item) => ({
            activityId: item.activityId,
            completionRate: item.completionRate,
            completionStatus: item.completionStatus,
            notes: item.notes ?? undefined,
          })) ?? undefined,
        },
      },
      {
        onSuccess: () => {
          submit(report.id, {
            onSuccess: handleClose,
            onError: (err: any) => Alert.alert(t('common:states.errorTitle'), err.message || t('createProgressReportSheet.submitErrorMessage')),
          });
        },
        onError: (err: any) => Alert.alert(t('common:states.errorTitle'), err.message || t('createProgressReportSheet.submitErrorMessage')),
      },
    );
  }

  return (
    <Modal visible={!!report} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View className="flex-1 justify-end bg-black/40">
          <GlassSurface
            intensity={65}
            rounded={0}
            style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28, borderBottomWidth: 0, maxHeight: '85%' }}
            className="px-5 pt-5 pb-24 gap-4"
          >
            <View className="flex-row items-center justify-between">
              <View className="gap-0.5">
                <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  {report?.period || t('reports.progressReportFallbackTitle')}
                </Text>
                {report?.dueDate && (
                  <Text className="text-xs font-sans text-neutral-500 dark:text-dark-500">
                    {t('reports.due', { date: formatDate(report.dueDate) })}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={handleClose} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.icon.muted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <Input label={t('createProgressReportSheet.completedContent')} value={completedContent} onChangeText={setCompletedContent} multiline numberOfLines={3} />
                <Input label={t('createProgressReportSheet.pendingContent')} value={pendingContent} onChangeText={setPendingContent} multiline numberOfLines={3} />
                <Input
                  label={t('createProgressReportSheet.overallCompletion')}
                  value={overallCompletionPct}
                  onChangeText={(v) => setOverallCompletionPct(v.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
                <Input label={t('createProgressReportSheet.nextPeriodPlan')} value={nextPeriodPlan} onChangeText={setNextPeriodPlan} multiline numberOfLines={3} />
              </View>
            </ScrollView>
            <Button label={t('createProgressReportSheet.submitReport')} onPress={handleSubmit} loading={isPending} fullWidth />
          </GlassSurface>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
