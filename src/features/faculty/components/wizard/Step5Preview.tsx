import { View, Text } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { useOpenCycles } from '@/features/faculty/hooks/useCycles';
import { useTracksByCycle } from '@/features/faculty/hooks/useTracks';
import { useResearchTypes } from '@/features/faculty/hooks/useResearchTypes';
import type { ProposalWizardFormValues } from '@/utils/validators';

function PreviewField({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View className="gap-1">
      <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">{label}</Text>
      <Text className="text-neutral-900 dark:text-neutral-50 text-base font-sans leading-relaxed">{value}</Text>
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <GlassSurface rounded={24} className="p-4 gap-3">
      {children}
    </GlassSurface>
  );
}

export function Step5Preview() {
  const { t } = useTranslation('faculty');
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
        <PreviewField label={t('fields.cycle')} value={cycleName} />
        <PreviewField label={t('fields.track')} value={trackName} />
        <PreviewField label={t('fields.researchType')} value={typeName} />
      </Card>

      <Card>
        <PreviewField label={t('fields.titleVI')} value={values.titleVI} />
        <PreviewField label={t('fields.titleEN')} value={values.titleEN} />
        <PreviewField label={t('fields.abstract')} value={values.abstractEN} />
        <PreviewField label={t('fields.objectives')} value={values.objectives} />
        <PreviewField label={t('fields.methodology')} value={values.methodology} />
        <PreviewField label={t('fields.duration')} value={t('fields.durationValue', { count: values.durationMonths })} />
      </Card>

      {values.members.length > 0 && (
        <Card>
          <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans mb-1">{t('step5.team', { count: values.members.length })}</Text>
          {values.members.map((m, i) => (
            <View key={i}>
              {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 my-2" />}
              <Text className="text-neutral-900 dark:text-neutral-50 text-base font-medium">
                {m.fullName}
                {m.isSecretary ? t('proposalDetail.secretarySuffix') : ''}
              </Text>
              <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">{m.email}</Text>
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}
