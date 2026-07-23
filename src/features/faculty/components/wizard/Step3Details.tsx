import { View, Text, TouchableOpacity } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/shared/components/ui/Input';
import type { ProposalWizardFormValues } from '@/utils/validators';

const FUNDING_OPTIONS: { value: 'WHOLE' | 'PARTIAL'; label: string }[] = [
  { value: 'WHOLE', label: 'Whole funding' },
  { value: 'PARTIAL', label: 'Partial funding' },
];

export function Step3Details() {
  const { control, formState: { errors } } = useFormContext<ProposalWizardFormValues>();

  return (
    <View className="gap-5">
      <Controller
        control={control}
        name="titleVI"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label="Title (Vietnamese)" required value={value} onChangeText={onChange} onBlur={onBlur} error={errors.titleVI?.message} multiline />
        )}
      />
      <Controller
        control={control}
        name="titleEN"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label="Title (English)" value={value} onChangeText={onChange} onBlur={onBlur} multiline />
        )}
      />
      <Controller
        control={control}
        name="abstractEN"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label="Abstract" value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={4} />
        )}
      />
      <Controller
        control={control}
        name="objectives"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label="Objectives" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.objectives?.message} multiline numberOfLines={3} />
        )}
      />
      <Controller
        control={control}
        name="methodology"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label="Methodology" value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} />
        )}
      />
      <Controller
        control={control}
        name="expectedOutput"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label="Expected Output" value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} />
        )}
      />
      <Controller
        control={control}
        name="urgency"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label="Urgency" value={value} onChangeText={onChange} onBlur={onBlur} multiline />
        )}
      />
      <Controller
        control={control}
        name="novelty"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label="Novelty" value={value} onChangeText={onChange} onBlur={onBlur} multiline />
        )}
      />
      <Controller
        control={control}
        name="applicationPotential"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label="Application Potential" value={value} onChangeText={onChange} onBlur={onBlur} multiline />
        )}
      />
      <Controller
        control={control}
        name="transferPotential"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label="Transfer Potential" value={value} onChangeText={onChange} onBlur={onBlur} multiline />
        )}
      />
      <Controller
        control={control}
        name="facilities"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label="Facilities" value={value} onChangeText={onChange} onBlur={onBlur} multiline />
        )}
      />

      <View className="gap-1.5">
        <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          Funding Method<Text className="text-red-500"> *</Text>
        </Text>
        <Controller
          control={control}
          name="fundingMethod"
          render={({ field: { value, onChange } }) => (
            <View className="flex-row gap-2">
              {FUNDING_OPTIONS.map((opt) => {
                const selected = value === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => onChange(opt.value)}
                    activeOpacity={0.7}
                    className={`flex-1 rounded-xl border p-3 items-center ${
                      selected ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-neutral-200 dark:border-dark-200 bg-white dark:bg-dark-50'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${selected ? 'text-violet-700 dark:text-violet-300' : 'text-neutral-900 dark:text-neutral-50'}`}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
      </View>

      <Controller
        control={control}
        name="durationMonths"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label="Duration (months)"
            required
            value={value ? String(value) : ''}
            onChangeText={(t) => onChange(Number(t.replace(/[^0-9]/g, '')) || 0)}
            onBlur={onBlur}
            keyboardType="numeric"
            error={errors.durationMonths?.message}
          />
        )}
      />
    </View>
  );
}
