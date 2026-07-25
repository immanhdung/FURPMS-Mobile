import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { PickerField } from '@/shared/components/ui/PickerField';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { FileUploader } from '@/shared/components/upload/FileUploader';
import { useMyContracts } from '@/features/faculty/hooks/useContracts';
import { useProgressReports } from '@/features/faculty/hooks/useProgressReports';
import { useFinalReport, useSubmitFinalReport } from '@/features/faculty/hooks/useFinalReports';
import { CreateProgressReportSheet } from '@/features/faculty/components/CreateProgressReportSheet';
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
    <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-2">
      {children}
    </View>
  );
}

function ProgressReportsTab({ contractId }: { contractId: string }) {
  const { t } = useTranslation('faculty');
  const { data: reports, isLoading } = useProgressReports(contractId);
  const [sheetVisible, setSheetVisible] = useState(false);

  if (isLoading) return <LoadingState message={t('reports.loadingProgressReports')} />;

  return (
    <View className="gap-3">
      {(reports ?? []).map((report) => (
        <ReportCard key={report.id}>
          <View className="flex-row items-center justify-between">
            <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">
              {report.period || t('reports.progressReportFallbackTitle')}
            </Text>
            {report.status && <Badge label={report.status} variant={report.status === 'SUBMITTED' ? 'info' : 'default'} size="sm" />}
          </View>
          {report.overallCompletionPct != null && (
            <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
              {t('reports.percentComplete', { percent: report.overallCompletionPct })}
            </Text>
          )}
          {report.dueDate && (
            <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{t('reports.due', { date: formatDate(report.dueDate) })}</Text>
          )}
          {report.meetingLink && (
            <Text className="text-violet-600 dark:text-violet-400 text-xs font-medium">{t('reports.meetingScheduled')}</Text>
          )}
          {report.evaluationResult && (
            <Text className="text-neutral-700 dark:text-neutral-200 text-xs font-sans">
              {t('reports.evaluation', { result: report.evaluationResult })}
            </Text>
          )}
        </ReportCard>
      ))}

      {(!reports || reports.length === 0) && (
        <EmptyState fullScreen={false} icon="📈" title={t('reports.noProgressReportsTitle')} description={t('reports.noProgressReportsDescription')} />
      )}

      <Button label={t('reports.newProgressReport')} variant="secondary" onPress={() => setSheetVisible(true)} fullWidth />

      <CreateProgressReportSheet visible={sheetVisible} contractId={contractId} onClose={() => setSheetVisible(false)} />
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
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className="mb-4">
            <PickerField
              label={t('reports.contract')}
              value={activeContractId}
              options={contracts.map((c) => ({ value: c.id, label: c.scopeTitle || c.contractNumber || c.id }))}
              onChange={setContractId}
            />
          </View>

          <View className="flex-row gap-2 mb-4">
            {(['PROGRESS', 'FINAL'] as Tab[]).map((tabKey) => (
              <TouchableOpacity
                key={tabKey}
                onPress={() => setTab(tabKey)}
                activeOpacity={0.7}
                className={`flex-1 items-center py-2.5 rounded-xl border ${
                  tab === tabKey ? 'bg-violet-500 dark:bg-violet-600 border-violet-500 dark:border-violet-600' : 'bg-white dark:bg-dark-50 border-neutral-200 dark:border-dark-200'
                }`}
              >
                <Text className={`text-sm font-medium ${tab === tabKey ? 'text-white' : 'text-neutral-600 dark:text-dark-500'}`}>
                  {tabKey === 'PROGRESS' ? t('reports.tabProgress') : t('reports.tabFinal')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeContractId && (tab === 'PROGRESS' ? <ProgressReportsTab contractId={activeContractId} /> : <FinalReportTab contractId={activeContractId} />)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
