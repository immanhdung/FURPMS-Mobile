import { useEffect } from 'react';
import { View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PickerField } from '@/shared/components/ui/PickerField';
import { useOpenCycles } from '@/features/faculty/hooks/useCycles';
import { useTracksByCycle } from '@/features/faculty/hooks/useTracks';
import type { ProposalWizardFormValues } from '@/utils/validators';

export function Step1CycleFieldType() {
  const { t } = useTranslation('faculty');
  const { control, watch, setValue, formState: { errors } } = useFormContext<ProposalWizardFormValues>();
  const cycleId = watch('cycleId');

  const { data: cycles, isLoading: cyclesLoading } = useOpenCycles();
  const { data: tracks, isLoading: tracksLoading } = useTracksByCycle(cycleId);

  const selectedCycle = cycles?.find((c) => c.id === cycleId);

  useEffect(() => {
    if (selectedCycle && selectedCycle.researchTypeId) {
      setValue('researchType', selectedCycle.researchTypeId, { shouldValidate: true });
    }
  }, [cycleId, selectedCycle, setValue]);

  return (
    <View className="gap-5">
      <Controller
        control={control}
        name="cycleId"
        render={({ field: { value } }) => (
          <PickerField
            label={t('step1.researchCycle')}
            required
            placeholder={cyclesLoading ? t('step1.loading') : t('step1.selectOpenCycle')}
            value={value}
            options={(cycles ?? []).map((c) => ({ value: c.id, label: c.name }))}
            onChange={(v) => {
              setValue('cycleId', v, { shouldValidate: true });
              setValue('trackId', '', { shouldValidate: false });
            }}
            error={errors.cycleId?.message}
            emptyMessage={t('step1.noOpenCycles')}
          />
        )}
      />

      <Controller
        control={control}
        name="trackId"
        render={({ field: { value, onChange } }) => (
          <PickerField
            label={t('fields.track')}
            required
            placeholder={!cycleId ? t('step1.selectCycleFirst') : tracksLoading ? t('step1.loading') : t('step1.selectTrack')}
            value={value || undefined}
            options={(tracks ?? []).map((track) => ({ value: track.id, label: track.name }))}
            onChange={onChange}
            error={errors.trackId?.message}
            disabled={!cycleId}
            emptyMessage={t('step1.noTracksAvailable')}
          />
        )}
      />
    </View>
  );
}
