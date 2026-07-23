import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PickerField } from '@/shared/components/ui/PickerField';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { useMyContracts } from '@/features/faculty/hooks/useContracts';
import { useProgressReports } from '@/features/faculty/hooks/useProgressReports';
import { useFinalReport, useSubmitFinalReport } from '@/features/faculty/hooks/useFinalReports';
import { CreateProgressReportSheet } from '@/features/faculty/components/CreateProgressReportSheet';
import { formatDate } from '@/utils/date';

type Tab = 'PROGRESS' | 'FINAL';

function ReportCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-2">
      {children}
    </View>
  );
}

function ProgressReportsTab({ contractId }: { contractId: string }) {
  const { data: reports, isLoading } = useProgressReports(contractId);
  const [sheetVisible, setSheetVisible] = useState(false);

  if (isLoading) return <LoadingState message="Loading progress reports…" />;

  return (
    <View className="gap-3">
      {(reports ?? []).map((report) => (
        <ReportCard key={report.id}>
          <View className="flex-row items-center justify-between">
            <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">
              {report.period || 'Progress Report'}
            </Text>
            {report.status && <Badge label={report.status} variant={report.status === 'SUBMITTED' ? 'info' : 'default'} size="sm" />}
          </View>
          {report.overallCompletionPct != null && (
            <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
              {report.overallCompletionPct}% complete
            </Text>
          )}
          {report.dueDate && (
            <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">Due {formatDate(report.dueDate)}</Text>
          )}
          {report.meetingLink && (
            <Text className="text-violet-600 dark:text-violet-400 text-xs font-medium">Meeting scheduled</Text>
          )}
          {report.evaluationResult && (
            <Text className="text-neutral-700 dark:text-neutral-200 text-xs font-sans">
              Evaluation: {report.evaluationResult}
            </Text>
          )}
        </ReportCard>
      ))}

      {(!reports || reports.length === 0) && (
        <EmptyState fullScreen={false} icon="📈" title="No progress reports yet" description="Reports scheduled by staff will appear here." />
      )}

      <Button label="New Progress Report" variant="secondary" onPress={() => setSheetVisible(true)} fullWidth />

      <CreateProgressReportSheet visible={sheetVisible} contractId={contractId} onClose={() => setSheetVisible(false)} />
    </View>
  );
}

function FinalReportTab({ contractId }: { contractId: string }) {
  const { data: report, isLoading } = useFinalReport(contractId);
  const { mutate: submitReport, isPending } = useSubmitFinalReport(contractId);

  const [reportFileUrl, setReportFileUrl] = useState('');
  const [summaryFileUrl, setSummaryFileUrl] = useState('');
  const [language, setLanguage] = useState('vi');

  if (isLoading) return <LoadingState message="Loading final report…" />;

  const editable = !report || !!report.revisionNotes;

  return (
    <View className="gap-3">
      {report && (
        <ReportCard>
          <View className="flex-row items-center justify-between">
            <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">Final Report</Text>
            {report.status && <Badge label={report.status} size="sm" />}
          </View>
          {report.submittedAt && (
            <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">Submitted {formatDate(report.submittedAt)}</Text>
          )}
          {report.revisionNotes && (
            <View className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 mt-1">
              <Text className="text-amber-700 dark:text-amber-300 text-xs font-semibold">Revision requested</Text>
              <Text className="text-amber-800 dark:text-amber-200 text-sm font-sans mt-1 leading-relaxed">{report.revisionNotes}</Text>
            </View>
          )}
        </ReportCard>
      )}

      {editable ? (
        <ReportCard>
          <Input label="Report file URL" placeholder="https://…" value={reportFileUrl} onChangeText={setReportFileUrl} autoCapitalize="none" />
          <Input label="Summary file URL (optional)" placeholder="https://…" value={summaryFileUrl} onChangeText={setSummaryFileUrl} autoCapitalize="none" />
          <Input label="Language" placeholder="vi" value={language} onChangeText={setLanguage} autoCapitalize="none" />
          <Button
            label={report ? 'Resubmit' : 'Submit Final Report'}
            onPress={() =>
              submitReport({ reportFileUrl, summaryFileUrl: summaryFileUrl || undefined, language })
            }
            loading={isPending}
            disabled={!reportFileUrl.trim()}
            fullWidth
          />
        </ReportCard>
      ) : (
        !report && <EmptyState fullScreen={false} icon="📄" title="No final report yet" description="Submit your final report once the project is complete." />
      )}
    </View>
  );
}

export default function ReportsScreen() {
  const { data: contracts, isLoading: contractsLoading } = useMyContracts();
  const [contractId, setContractId] = useState<string | undefined>();
  const [tab, setTab] = useState<Tab>('PROGRESS');

  const activeContractId = contractId ?? contracts?.[0]?.id;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      <View className="px-5 pt-6 pb-4 gap-0.5">
        <Text className="text-neutral-900 dark:text-neutral-50 text-2xl font-bold tracking-tight">Reports</Text>
        <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">Progress and final reports for your contracts</Text>
      </View>

      {contractsLoading ? (
        <LoadingState message="Loading contracts…" />
      ) : !contracts || contracts.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No active contracts"
          description="Reports become available once one of your proposals is approved and a contract is signed."
        />
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className="mb-4">
            <PickerField
              label="Contract"
              value={activeContractId}
              options={contracts.map((c) => ({ value: c.id, label: c.scopeTitle || c.contractNumber || c.id }))}
              onChange={setContractId}
            />
          </View>

          <View className="flex-row gap-2 mb-4">
            {(['PROGRESS', 'FINAL'] as Tab[]).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                activeOpacity={0.7}
                className={`flex-1 items-center py-2.5 rounded-xl border ${
                  tab === t ? 'bg-violet-500 dark:bg-violet-600 border-violet-500 dark:border-violet-600' : 'bg-white dark:bg-dark-50 border-neutral-200 dark:border-dark-200'
                }`}
              >
                <Text className={`text-sm font-medium ${tab === t ? 'text-white' : 'text-neutral-600 dark:text-dark-500'}`}>
                  {t === 'PROGRESS' ? 'Progress' : 'Final'}
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
