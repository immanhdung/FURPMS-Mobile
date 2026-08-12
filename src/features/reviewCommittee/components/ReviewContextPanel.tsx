import { Text, View } from 'react-native';
import { Button } from '@/shared/components/ui/Button';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { useProposal } from '@/features/faculty/hooks/useProposals';
import { useGenerateProposalSummary, useProposalSummary } from '@/features/faculty/hooks/useProposalAi';

export function ReviewContextPanel({ proposalId }: { proposalId: string }) {
  const proposal = useProposal(proposalId);
  const summary = useProposalSummary(proposalId);
  const generate = useGenerateProposalSummary(proposalId);
  if (proposal.isLoading || summary.isLoading) return <LoadingState message="Đang tải thông tin đề cương..." />;
  const p = proposal.data;
  const s = summary.data;
  return (
    <View className="gap-4">
      {p && <GlassSurface rounded={24} className="p-4 gap-3"><Text className="text-neutral-900 dark:text-neutral-50 text-base font-semibold">Thông tin đề cương</Text><Field label="Tóm tắt" value={p.abstractEN} /><Field label="Mục tiêu" value={p.objectives} /><Field label="Phương pháp" value={p.methodology} /><Field label="Sản phẩm dự kiến" value={p.expectedOutput} /></GlassSurface>}
      <GlassSurface rounded={24} className="p-4 gap-3">
        <Text className="text-neutral-900 dark:text-neutral-50 text-base font-semibold">Tóm tắt AI</Text>
        {s ? <View className="gap-3"><Text className="text-neutral-700 dark:text-neutral-200 text-sm leading-relaxed">{s.editedText || s.summaryText}</Text>{s.strengths?.length ? <Field label="Điểm mạnh" value={s.strengths.join(' · ')} /> : null}{s.weaknesses?.length ? <Field label="Điểm cần lưu ý" value={s.weaknesses.join(' · ')} /> : null}</View> : <View className="gap-3"><Text className="text-neutral-500 dark:text-dark-500 text-sm">Chưa có tóm tắt AI cho đề cương này.</Text><Button label="Tạo tóm tắt AI" loading={generate.isPending} fullWidth onPress={() => generate.mutate()} /></View>}
      </GlassSurface>
    </View>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return <View className="gap-1"><Text className="text-neutral-500 dark:text-dark-500 text-xs">{label}</Text><Text className="text-neutral-700 dark:text-neutral-200 text-sm leading-relaxed">{value}</Text></View>;
}
