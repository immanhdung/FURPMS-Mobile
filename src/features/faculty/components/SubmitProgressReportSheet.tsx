import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { useUpdateProgressReport, useSubmitProgressReport, useProgressReportDetail, useProgressReportDocuments, useUploadProgressReportDocument } from '@/features/faculty/hooks/useProgressReports';
import { uploadService, type PickedFile } from '@/services/upload.service';
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
  const { data: docs } = useProgressReportDocuments(report?.id);
  const { mutate: uploadDoc, isPending: isUploadingDoc } = useUploadProgressReportDocument(report?.id ?? '');

  const [completedContent, setCompletedContent] = useState('');
  const [pendingContent, setPendingContent] = useState('');
  const [overallCompletionPct, setOverallCompletionPct] = useState('');
  const [nextPeriodPlan, setNextPeriodPlan] = useState('');
  const [reportFileUrl, setReportFileUrl] = useState('');

  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isPending = isUpdating || isSubmitting;

  useEffect(() => {
    if (!report) return;
    setCompletedContent(detail?.completedContent ?? '');
    setPendingContent(detail?.pendingContent ?? '');
    setOverallCompletionPct(report.overallCompletionPct != null ? String(report.overallCompletionPct) : '');
    setNextPeriodPlan(detail?.nextPeriodPlan ?? '');
    setReportFileUrl(detail?.reportFileUrl ?? '');
  }, [report, detail]);

  async function handlePickAndUpload() {
    if (!report) return;
    setUploadError(null);
    try {
      const file = await uploadService.pickFile([
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]);
      if (file) {
        setPickedFile(file);
        setUploadProgress(0);
        uploadDoc(
          {
            file,
            onProgress: (p) => setUploadProgress(p.percentage),
          },
          {
            onSuccess: () => {
              setPickedFile(null);
              setUploadProgress(null);
            },
            onError: (err: any) => {
              setUploadError(err.message || 'Upload failed');
              setUploadProgress(null);
            },
          }
        );
      }
    } catch (err) {
      setUploadError('Failed to pick or upload file');
    }
  }

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
          reportFileUrl: reportFileUrl.trim() || undefined,
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
                
                <View className="rounded-2xl border border-neutral-200 dark:border-dark-300 p-3 bg-neutral-50/50 dark:bg-dark-100/50 my-1 gap-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-2 gap-0.5">
                      <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">
                        Tài liệu đính kèm (BM06)
                      </Text>
                      <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                        Đính kèm tệp tin báo cáo định dạng PDF, DOC, DOCX.
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handlePickAndUpload}
                      disabled={isUploadingDoc}
                      activeOpacity={0.7}
                      className="px-3 py-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex-row items-center gap-1.5"
                    >
                      <Ionicons name="cloud-upload-outline" size={16} color={colors.accent.primary} />
                      <Text className="text-violet-700 dark:text-violet-400 text-xs font-semibold">
                        Tải lên
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {isUploadingDoc && (
                    <View className="flex-row items-center gap-2 bg-violet-50 dark:bg-violet-950/20 px-3 py-2 rounded-xl">
                      <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans flex-1" numberOfLines={1}>
                        Đang tải lên {pickedFile?.name}...
                      </Text>
                      <Text className="text-violet-600 dark:text-violet-400 text-xs font-semibold font-mono">
                        {uploadProgress}%
                      </Text>
                    </View>
                  )}

                  {uploadError && (
                    <Text className="text-red-500 dark:text-red-400 text-xs font-sans">
                      Lỗi: {uploadError}
                    </Text>
                  )}

                  {docs && docs.length > 0 && (
                    <View className="gap-1.5 pt-2 border-t border-neutral-200 dark:border-dark-300">
                      {docs.map((doc) => (
                        <View key={doc.id} className="flex-row items-center gap-2 bg-neutral-100/50 dark:bg-dark-200/50 px-3 py-1.5 rounded-xl">
                          <Ionicons name="document-text-outline" size={14} color={colors.accent.primary} />
                          <Text className="text-neutral-800 dark:text-neutral-200 text-xs flex-1" numberOfLines={1}>
                            {decodeURIComponent(doc.fileName)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <Input
                  label="Hoặc dán đường dẫn tài liệu"
                  placeholder="Đường dẫn đến file báo cáo (Drive, OneDrive...)"
                  value={reportFileUrl}
                  onChangeText={setReportFileUrl}
                />
              </View>
            </ScrollView>
            <Button label={t('createProgressReportSheet.submitReport')} onPress={handleSubmit} loading={isPending} fullWidth />
          </GlassSurface>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
