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
      {p && (
        <GlassSurface rounded={24} className="p-4 gap-3">
          <Text className="text-violet-700 dark:text-violet-300 text-base font-bold">Thông tin đề cương</Text>
          <Field label="Tóm tắt" value={p.abstractEN} color="violet" />
          <Field label="Mục tiêu" value={p.objectives} color="violet" />
          <Field label="Phương pháp" value={p.methodology} color="violet" />
          <Field label="Sản phẩm dự kiến" value={p.expectedOutput} color="violet" />
        </GlassSurface>
      )}
      <GlassSurface rounded={24} className="p-4 gap-3">
        <Text className="text-emerald-700 dark:text-emerald-400 text-base font-bold">Tóm tắt AI</Text>
        {s ? (
          <View className="gap-3">
            <Text className="text-neutral-700 dark:text-neutral-200 text-sm leading-relaxed">{s.editedText || s.summaryText}</Text>
            {s.strengths?.length ? <Field label="Điểm mạnh" value={s.strengths.join(' · ')} color="emerald" /> : null}
            {s.weaknesses?.length ? <Field label="Điểm cần lưu ý" value={s.weaknesses.join(' · ')} color="amber" /> : null}
          </View>
        ) : (
          <View className="gap-3">
            <Text className="text-neutral-500 dark:text-dark-500 text-sm">Chưa có tóm tắt AI cho đề cương này.</Text>
            <Button label="Tạo tóm tắt AI" loading={generate.isPending} fullWidth onPress={() => generate.mutate()} />
          </View>
        )}
      </GlassSurface>
    </View>
  );
}

function Field({ label, value, color = 'violet' }: { label: string; value?: string | null; color?: 'violet' | 'emerald' | 'amber' }) {
  if (!value) return null;
  const labelColorClass =
    color === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-400'
      : color === 'amber'
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-violet-600 dark:text-violet-400';

  return (
    <View className="gap-1 mt-1">
      <Text className={`${labelColorClass} text-xs font-semibold uppercase tracking-wider`}>{label}</Text>
      <Text className="text-neutral-700 dark:text-neutral-200 text-sm leading-relaxed">{value}</Text>
    </View>
  );
}
