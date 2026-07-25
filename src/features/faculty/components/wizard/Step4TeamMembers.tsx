import { View, Text, TouchableOpacity } from 'react-native';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/shared/components/ui/Input';
import type { ProposalWizardFormValues } from '@/utils/validators';

export function Step4TeamMembers() {
  const { t } = useTranslation('faculty');
  const { colors } = useTheme();
  const { control } = useFormContext<ProposalWizardFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'members' });

  return (
    <View className="gap-4">
      {fields.length === 0 && (
        <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans text-center py-4">
          {t('step4.noMembers')}
        </Text>
      )}

      {fields.map((field, index) => (
        <View key={field.id} className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">{t('step4.member', { index: index + 1 })}</Text>
            <TouchableOpacity onPress={() => remove(index)} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={colors.accent.danger} />
            </TouchableOpacity>
          </View>

          <Controller
            control={control}
            name={`members.${index}.fullName`}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input label={t('step4.fullName')} required value={value} onChangeText={onChange} onBlur={onBlur} />
            )}
          />
          <Controller
            control={control}
            name={`members.${index}.email`}
            render={({ field: { value, onChange, onBlur } }) => (
              <Input label={t('step4.email')} required value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="email-address" autoCapitalize="none" />
            )}
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name={`members.${index}.department`}
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input label={t('step4.department')} value={value} onChangeText={onChange} onBlur={onBlur} />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name={`members.${index}.academicTitle`}
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input label={t('step4.academicTitle')} value={value} onChangeText={onChange} onBlur={onBlur} />
                )}
              />
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name={`members.${index}.role`}
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input label={t('step4.role')} value={value} onChangeText={onChange} onBlur={onBlur} />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name={`members.${index}.workMonths`}
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    label={t('step4.workMonths')}
                    value={value ? String(value) : ''}
                    onChangeText={(t) => onChange(Number(t.replace(/[^0-9]/g, '')) || 0)}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name={`members.${index}.isSecretary`}
            render={({ field: { value, onChange } }) => (
              <TouchableOpacity onPress={() => onChange(!value)} activeOpacity={0.7} className="flex-row items-center gap-2">
                <View className={`w-5 h-5 rounded-md border items-center justify-center ${value ? 'bg-violet-500 border-violet-500' : 'border-neutral-300 dark:border-dark-300'}`}>
                  {value && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-sans">{t('step4.councilSecretary')}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ))}

      <TouchableOpacity
        onPress={() =>
          append({
            fullName: '',
            email: '',
            department: '',
            role: '',
            workMonths: 0,
            academicTitle: '',
            memberRoleCode: '',
            isSecretary: false,
          })
        }
        activeOpacity={0.7}
        className="flex-row items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-neutral-300 dark:border-dark-300"
      >
        <Ionicons name="add-circle-outline" size={18} color={colors.accent.primary} />
        <Text className="text-violet-600 dark:text-violet-400 text-sm font-medium">{t('step4.addTeamMember')}</Text>
      </TouchableOpacity>
    </View>
  );
}
