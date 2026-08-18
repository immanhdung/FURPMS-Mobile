import { View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/components/ui/Input';
import type { ProposalWizardFormValues } from '@/utils/validators';

export function Step3Details() {
  const { t } = useTranslation('faculty');
  const { control, formState: { errors } } = useFormContext<ProposalWizardFormValues>();



  return (
    <View className="gap-5">
      <Controller
        control={control}
        name="titleVI"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label={t('fields.titleVI')} required value={value} onChangeText={onChange} onBlur={onBlur} error={errors.titleVI?.message} multiline />
        )}
      />
      <Controller
        control={control}
        name="titleEN"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label={t('fields.titleEN')} value={value} onChangeText={onChange} onBlur={onBlur} multiline />
        )}
      />
      <Controller
        control={control}
        name="abstractEN"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label={t('fields.abstract')} value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={4} />
        )}
      />
      <Controller
        control={control}
        name="objectives"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label={t('fields.objectives')} value={value} onChangeText={onChange} onBlur={onBlur} error={errors.objectives?.message} multiline numberOfLines={3} />
        )}
      />
      <Controller
        control={control}
        name="methodology"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input label={t('fields.methodology')} value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} />
        )}
      />


      <Controller
        control={control}
        name="durationMonths"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label={t('fields.durationMonths')}
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
