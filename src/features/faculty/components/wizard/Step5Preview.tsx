import { View, Text } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { useOpenCycles } from '@/features/faculty/hooks/useCycles';
import { useTracksByCycle } from '@/features/faculty/hooks/useTracks';
import { useResearchTypes } from '@/features/faculty/hooks/useResearchTypes';
import type { ProposalWizardFormValues } from '@/utils/validators';

function PreviewField({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View className="gap-1">
      <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{label}</Text>
      <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-sans leading-relaxed">{value}</Text>
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-3">
      {children}
    </View>
  );
}

export function Step5Preview() {
  const { watch } = useFormContext<ProposalWizardFormValues>();
  const values = watch();

  const { data: cycles } = useOpenCycles();
  const { data: tracks } = useTracksByCycle(values.cycleId);
  const { data: researchTypes } = useResearchTypes();

  const cycleName = cycles?.find((c) => c.id === values.cycleId)?.name;
  const trackName = tracks?.find((t) => t.id === values.trackId)?.name;
  const typeName = researchTypes?.find((t) => t.id === values.researchType)?.name;

  return (
    <View className="gap-5">
      <Card>
        <PreviewField label="Cycle" value={cycleName} />
        <PreviewField label="Track" value={trackName} />
        <PreviewField label="Research Type" value={typeName} />
      </Card>

      <Card>
        <PreviewField label="Title (Vietnamese)" value={values.titleVI} />
        <PreviewField label="Title (English)" value={values.titleEN} />
        <PreviewField label="Abstract" value={values.abstractEN} />
        <PreviewField label="Objectives" value={values.objectives} />
        <PreviewField label="Methodology" value={values.methodology} />
        <PreviewField label="Expected Output" value={values.expectedOutput} />
      </Card>

      <Card>
        <PreviewField label="Urgency" value={values.urgency} />
        <PreviewField label="Novelty" value={values.novelty} />
        <PreviewField label="Application Potential" value={values.applicationPotential} />
        <PreviewField label="Transfer Potential" value={values.transferPotential} />
        <PreviewField label="Facilities" value={values.facilities} />
      </Card>

      <Card>
        <PreviewField label="Funding Method" value={values.fundingMethod === 'PARTIAL' ? 'Partial' : 'Whole'} />
        <PreviewField label="Duration" value={`${values.durationMonths} months`} />
      </Card>

      {values.members.length > 0 && (
        <Card>
          <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mb-1">Team ({values.members.length})</Text>
          {values.members.map((m, i) => (
            <View key={i}>
              {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 my-2" />}
              <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">
                {m.fullName}
                {m.isSecretary ? ' (Secretary)' : ''}
              </Text>
              <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{m.email}</Text>
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}
