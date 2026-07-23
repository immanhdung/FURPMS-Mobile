import { View, Text, TouchableOpacity } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { PickerField } from '@/shared/components/ui/PickerField';
import { useOpenCycles } from '@/features/faculty/hooks/useCycles';
import { useTracksByCycle } from '@/features/faculty/hooks/useTracks';
import { useResearchTypes } from '@/features/faculty/hooks/useResearchTypes';
import type { ProposalWizardFormValues } from '@/utils/validators';

export function Step1CycleFieldType() {
  const { control, watch, setValue, formState: { errors } } = useFormContext<ProposalWizardFormValues>();
  const cycleId = watch('cycleId');

  const { data: cycles, isLoading: cyclesLoading } = useOpenCycles();
  const { data: tracks, isLoading: tracksLoading } = useTracksByCycle(cycleId);
  const { data: researchTypes, isLoading: typesLoading } = useResearchTypes();

  return (
    <View className="gap-5">
      <Controller
        control={control}
        name="cycleId"
        render={({ field: { value } }) => (
          <PickerField
            label="Research Cycle"
            required
            placeholder={cyclesLoading ? 'Loading…' : 'Select an open cycle'}
            value={value}
            options={(cycles ?? []).map((c) => ({ value: c.id, label: c.name }))}
            onChange={(v) => {
              setValue('cycleId', v, { shouldValidate: true });
              setValue('trackId', '', { shouldValidate: false });
            }}
            error={errors.cycleId?.message}
            emptyMessage="No open cycles right now"
          />
        )}
      />

      <Controller
        control={control}
        name="trackId"
        render={({ field: { value, onChange } }) => (
          <PickerField
            label="Track"
            required
            placeholder={!cycleId ? 'Select a cycle first' : tracksLoading ? 'Loading…' : 'Select a track'}
            value={value || undefined}
            options={(tracks ?? []).map((t) => ({ value: t.id, label: t.name }))}
            onChange={onChange}
            error={errors.trackId?.message}
            disabled={!cycleId}
            emptyMessage="No tracks available for this cycle"
          />
        )}
      />

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          Research Type<Text className="text-red-500"> *</Text>
        </Text>
        <Controller
          control={control}
          name="researchType"
          render={({ field: { value, onChange } }) => (
            <View className="gap-2">
              {typesLoading && (
                <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans">Loading research types…</Text>
              )}
              {(researchTypes ?? []).map((type) => {
                const selected = value === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => onChange(type.id)}
                    activeOpacity={0.7}
                    className={`rounded-xl border p-4 ${
                      selected
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                        : 'border-neutral-200 dark:border-dark-200 bg-white dark:bg-dark-50'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selected ? 'text-violet-700 dark:text-violet-300' : 'text-neutral-900 dark:text-neutral-50'
                      }`}
                    >
                      {type.name}
                    </Text>
                    <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mt-0.5">
                      {type.requireOrderingUnit
                        ? 'Based on an imported research topic'
                        : 'Upload a document for AI-assisted extraction'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
        {errors.researchType?.message && (
          <Text className="text-xs font-sans text-red-500 dark:text-red-400">{errors.researchType.message}</Text>
        )}
      </View>
    </View>
  );
}
