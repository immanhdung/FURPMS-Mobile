import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { videoMeetingService } from '@/services/video-meeting.service';
import { PickerField } from '@/shared/components/ui/PickerField';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { FileUploader } from '@/shared/components/upload/FileUploader';
import { useMyContracts } from '@/features/faculty/hooks/useContracts';
import { useProgressReports } from '@/features/faculty/hooks/useProgressReports';
import { useFinalReport, useSubmitFinalReport } from '@/features/faculty/hooks/useFinalReports';
import { SubmitProgressReportSheet } from '@/features/faculty/components/SubmitProgressReportSheet';
import type { ProgressReport } from '@/features/faculty/types/progress-report.types';
import { finalReportService, type FinalReportDocumentType } from '@/features/faculty/services/final-report.service';
import { uploadService, type PickedFile, type UploadedFile } from '@/services/upload.service';
import { formatDate } from '@/utils/date';

type Tab = 'PROGRESS' | 'FINAL';

const REPORT_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function useDocumentUpload(contractId: string, documentType: FinalReportDocumentType) {
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isPickingFile, setIsPickingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<{ percentage: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = useCallback(async () => {
    setIsPickingFile(true);
    setError(null);
    try {
      const file = await uploadService.pickFile(REPORT_FILE_TYPES);
      if (file) setPickedFile(file);
    } finally {
      setIsPickingFile(false);
    }
  }, []);

  const upload = useCallback(async () => {
    if (!pickedFile) return;
    setIsUploading(true);
    setError(null);
    try {
      const result = await finalReportService.uploadDocument(contractId, pickedFile, documentType, (p) =>
        setProgress(p),
      );
      setUploadedFile(result);
      setPickedFile(null);
      setProgress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [pickedFile, contractId, documentType]);

  const remove = useCallback(() => {
    setPickedFile(null);
    setUploadedFile(null);
    setProgress(null);
    setError(null);
  }, []);

  return { pickedFile, uploadedFile, isPickingFile, isUploading, progress, error, pick, upload, remove };
}

function ReportCard({ children }: { children: React.ReactNode }) {
  return (
    <GlassSurface rounded={24} className="p-4 gap-2">
      {children}
    </GlassSurface>
  );
}

function ProgressReportsTab({ contractId }: { contractId: string }) {
  const { t } = useTranslation('faculty');
  const { colors } = useTheme();
  const { data: reports, isLoading } = useProgressReports(contractId);
  const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null);

  if (isLoading) return <LoadingState message={t('reports.loadingProgressReports')} />;

  return (
    <View className="gap-3">
      {(reports ?? []).map((report) => {
        const awaitingSubmission = !report.submittedAt;
        return (
          <ReportCard key={report.id}>
            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">
                {report.period || t('reports.progressReportFallbackTitle')}
              </Text>
              {report.status && (
                <Badge label={report.status} variant={awaitingSubmission ? 'warning' : 'info'} size="sm" />
              )}
            </View>
            {report.overallCompletionPct != null && (
              <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                {t('reports.percentComplete', { percent: report.overallCompletionPct })}
              </Text>
            )}
            {report.dueDate && (
              <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{t('reports.due', { date: formatDate(report.dueDate) })}</Text>
            )}
            {report.scheduledMeetingAt && (
              <View className="flex-row items-center gap-1.5 mt-1 bg-violet-50 dark:bg-violet-950/20 p-2.5 rounded-xl border border-violet-100 dark:border-violet-900/30">
                <Ionicons name="calendar-outline" size={16} color={colors.accent.primary} />
                <Text className="text-neutral-800 dark:text-neutral-200 text-xs font-medium">
                  Lịch họp: {formatDate(report.scheduledMeetingAt)}
                </Text>
              </View>
            )}
            {report.meetingLink && (
              <TouchableOpacity
                onPress={() => videoMeetingService.join({ url: report.meetingLink! })}
                activeOpacity={0.7}
                className="flex-row items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30"
              >
                <Ionicons name="videocam-outline" size={16} color="#10B981" />
                <Text className="text-emerald-700 dark:text-emerald-400 text-xs font-medium flex-1" numberOfLines={1}>
                  Link họp: {report.meetingLink}
                </Text>
              </TouchableOpacity>
            )}
            {report.evaluationResult && (
              <Text className="text-neutral-700 dark:text-neutral-200 text-xs font-sans">
                {t('reports.evaluation', { result: report.evaluationResult })}
              </Text>
            )}
            {awaitingSubmission && (
              <Button
                label={t('reports.fillReport')}
                variant="secondary"
                size="sm"
                onPress={() => setSelectedReport(report)}
              />
            )}
          </ReportCard>
        );
      })}

      {(!reports || reports.length === 0) && (
        <EmptyState fullScreen={false} icon="📈" title={t('reports.noProgressReportsTitle')} description={t('reports.noProgressReportsDescription')} />
      )}

      <SubmitProgressReportSheet contractId={contractId} report={selectedReport} onClose={() => setSelectedReport(null)} />
    </View>
  );
}

function FinalReportTab({ contractId }: { contractId: string }) {
  const { t } = useTranslation('faculty');
  const { data: report, isLoading } = useFinalReport(contractId);
  const { mutate: submitReport, isPending } = useSubmitFinalReport(contractId);

  const [language, setLanguage] = useState('vi');
  const reportUpload = useDocumentUpload(contractId, 'REPORT');
  const summaryUpload = useDocumentUpload(contractId, 'SUMMARY');

  if (isLoading) return <LoadingState message={t('reports.loadingFinalReport')} />;

  const editable = !report || !!report.revisionNotes;

  return (
    <View className="gap-3">
      {report && (
        <ReportCard>
          <View className="flex-row items-center justify-between">
            <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">{t('reports.finalReportTitle')}</Text>
            {report.status && <Badge label={report.status} size="sm" />}
          </View>
          {report.submittedAt && (
            <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{t('reports.submitted', { date: formatDate(report.submittedAt) })}</Text>
          )}
          {report.revisionNotes && (
            <View className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 mt-1">
              <Text className="text-amber-700 dark:text-amber-300 text-xs font-semibold">{t('reports.revisionRequested')}</Text>
              <Text className="text-amber-800 dark:text-amber-200 text-sm font-sans mt-1 leading-relaxed">{report.revisionNotes}</Text>
            </View>
          )}
        </ReportCard>
      )}

      {editable ? (
        <ReportCard>
          <FileUploader
            pickedFile={reportUpload.pickedFile}
            uploadedFile={reportUpload.uploadedFile}
            isPickingFile={reportUpload.isPickingFile}
            isUploading={reportUpload.isUploading}
            progress={reportUpload.progress}
            error={reportUpload.error}
            onPick={reportUpload.pick}
            onUpload={reportUpload.upload}
            onRemove={reportUpload.remove}
            label={t('reports.reportFile')}
            hint={t('reports.reportFileHint')}
          />
          <FileUploader
            pickedFile={summaryUpload.pickedFile}
            uploadedFile={summaryUpload.uploadedFile}
            isPickingFile={summaryUpload.isPickingFile}
            isUploading={summaryUpload.isUploading}
            progress={summaryUpload.progress}
            error={summaryUpload.error}
            onPick={summaryUpload.pick}
            onUpload={summaryUpload.upload}
            onRemove={summaryUpload.remove}
            label={t('reports.summaryFile')}
            hint={t('reports.summaryFileHint')}
          />
          <Input label={t('reports.language')} placeholder="vi" value={language} onChangeText={setLanguage} autoCapitalize="none" />
          <Button
            label={report ? t('reports.resubmit') : t('reports.submitFinalReport')}
            onPress={() =>
              submitReport({
                reportFileUrl: reportUpload.uploadedFile!.url,
                summaryFileUrl: summaryUpload.uploadedFile?.url,
                language,
              })
            }
            loading={isPending}
            disabled={!reportUpload.uploadedFile}
            fullWidth
          />
        </ReportCard>
      ) : (
        !report && <EmptyState fullScreen={false} icon="📄" title={t('reports.noFinalReportTitle')} description={t('reports.noFinalReportDescription')} />
      )}
    </View>
  );
}

export default function ReportsScreen() {
  const { t } = useTranslation('faculty');
  const { data: contracts, isLoading: contractsLoading } = useMyContracts();
  const [contractId, setContractId] = useState<string | undefined>();
  const [tab, setTab] = useState<Tab>('PROGRESS');

  const activeContractId = contractId ?? contracts?.[0]?.id;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View className="px-5 pt-6 pb-4 gap-0.5">
          <Text className="text-neutral-900 dark:text-neutral-50 text-2xl font-bold tracking-tight">{t('reports.title')}</Text>
          <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">{t('reports.subtitle')}</Text>
        </View>

        {contractsLoading ? (
          <LoadingState message={t('reports.loadingContracts')} />
        ) : !contracts || contracts.length === 0 ? (
          <EmptyState
            icon="📊"
            title={t('reports.noContractsTitle')}
            description={t('reports.noContractsDescription')}
          />
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <PickerField
                label={t('reports.contract')}
                value={activeContractId}
                options={contracts.map((c) => ({ value: c.id, label: c.scopeTitle || c.contractNumber || c.id }))}
                onChange={setContractId}
              />
            </View>

            <View className="flex-row gap-2 mb-4">
              {(['PROGRESS', 'FINAL'] as Tab[]).map((tabKey) =>
                tab === tabKey ? (
                  <TouchableOpacity
                    key={tabKey}
                    onPress={() => setTab(tabKey)}
                    activeOpacity={0.7}
                    className="flex-1 items-center py-2.5 rounded-xl bg-violet-500 dark:bg-violet-600"
                  >
                    <Text className="text-sm font-medium text-white">
                      {tabKey === 'PROGRESS' ? t('reports.tabProgress') : t('reports.tabFinal')}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity key={tabKey} onPress={() => setTab(tabKey)} activeOpacity={0.7} className="flex-1">
                    <GlassSurface rounded={12} className="items-center py-2.5">
                      <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                        {tabKey === 'PROGRESS' ? t('reports.tabProgress') : t('reports.tabFinal')}
                      </Text>
                    </GlassSurface>
                  </TouchableOpacity>
                ),
              )}
            </View>

            {activeContractId && (tab === 'PROGRESS' ? <ProgressReportsTab contractId={activeContractId} /> : <FinalReportTab contractId={activeContractId} />)}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
