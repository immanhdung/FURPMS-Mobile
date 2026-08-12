import { Text, View } from 'react-native';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { useAcceptanceDossier } from '../hooks/useAcceptanceDossier';
import { formatDate } from '@/utils/date';

export function AcceptanceDossierPanel({ councilId, proposalId }: { councilId: string; proposalId: string }) {
  const { data, isLoading } = useAcceptanceDossier(councilId, proposalId);
  if (isLoading) return <LoadingState message="Đang tải hồ sơ nghiệm thu..." />;
  if (!data) return <EmptyState fullScreen={false} icon="📁" title="Chưa có hồ sơ nghiệm thu" description="Hồ sơ sẽ xuất hiện khi đề tài có dữ liệu thực hiện." />;
  return <View className="gap-4"><GlassSurface rounded={24} className="p-4"><Text className="text-neutral-900 dark:text-neutral-50 font-semibold">Tổng quan</Text><Text className="text-neutral-500 dark:text-dark-500 text-sm mt-1">{data.contractNumber ?? 'Hợp đồng'} · Sản phẩm đạt: {data.deliverablesPassed}/{data.deliverablesTotal}</Text></GlassSurface>
    <Section title="Báo cáo tiến độ">{data.progressReports.length ? data.progressReports.map((r) => <Row key={r.reportRound} title={r.roundName || `Kỳ ${r.reportRound}`} detail={`${r.overallCompletionPct}%${r.evaluationResult ? ` · ${r.evaluationResult}` : ''}${r.evaluationComments ? `\n${r.evaluationComments}` : ''}`} />) : <Empty label="Chưa có báo cáo tiến độ" />}</Section>
    <Section title="Sản phẩm">{data.deliverables.length ? data.deliverables.map((d) => <Row key={d.id} title={d.productName} detail={`${d.acceptanceStatus ?? 'Chưa đánh giá'}${d.qualityAssessment ? ` · ${d.qualityAssessment}` : ''}${d.submittedAt ? `\nĐã nộp: ${formatDate(d.submittedAt)}` : ''}`} />) : <Empty label="Chưa có sản phẩm" />}</Section>
    <Section title="Báo cáo tổng kết">{data.finalReport ? <Row title={data.finalReport.status} detail={data.finalReport.submittedAt ? `Đã nộp: ${formatDate(data.finalReport.submittedAt)}` : 'Chưa nộp'} /> : <Empty label="Chưa có báo cáo tổng kết" />}</Section>
  </View>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <View className="gap-2"><Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold">{title}</Text><GlassSurface rounded={24}>{children}</GlassSurface></View>; }
function Row({ title, detail }: { title: string; detail: string }) { return <View className="p-4 border-b border-neutral-100 dark:border-dark-200"><Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">{title}</Text><Text className="text-neutral-500 dark:text-dark-500 text-xs mt-1">{detail}</Text></View>; }
function Empty({ label }: { label: string }) { return <Text className="p-4 text-neutral-500 dark:text-dark-500 text-sm">{label}</Text>; }
