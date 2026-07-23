import { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@/hooks/useTheme';
import { useCreateProposal, useUpdateProposal } from '@/features/faculty/hooks/useProposals';
import { Button } from '@/shared/components/ui/Button';
import { createProposalSchema, type CreateProposalFormValues } from '@/utils/validators';

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-medium mb-1.5">
      {label}
      {required && <Text className="text-red-500"> *</Text>}
    </Text>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <Text className="text-red-500 dark:text-red-400 text-xs font-sans mt-1">{message}</Text>;
}

export default function CreateProposalScreen() {
  const router = useRouter();
  const { edit: editId } = useLocalSearchParams<{ edit?: string }>();
  const { colors } = useTheme();
  const isEditing = !!editId;

  const { mutate: createProposal, isPending: isCreating } = useCreateProposal();
  const { mutate: updateProposal, isPending: isUpdating } = useUpdateProposal(editId ?? '');

  const isPending = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProposalFormValues>({
    resolver: zodResolver(createProposalSchema),
    defaultValues: {
      title: '',
      abstract: '',
      researchField: '',
      startDate: '',
      endDate: '',
      budget: 0,
      objectives: '',
      methodology: '',
      expectedOutcomes: '',
    },
  });

  const inputClass =
    'bg-white dark:bg-dark-50 border border-neutral-200 dark:border-dark-200 rounded-xl px-4 py-3 text-neutral-900 dark:text-neutral-50 text-sm font-sans';

  const handleSave = (data: CreateProposalFormValues) => {
    const payload = { ...data, budgetItems: [], team: [] };
    if (isEditing) {
      updateProposal(payload, {
        onSuccess: () => {
          Alert.alert('Saved', 'Your proposal has been updated.');
          router.back();
        },
        onError: () => Alert.alert('Error', 'Failed to save changes. Please try again.'),
      });
    } else {
      createProposal(payload, {
        onSuccess: (proposal) => {
          Alert.alert('Draft Saved', 'Your proposal has been saved as a draft.');
          router.replace(`/(faculty)/proposals/${proposal.id}`);
        },
        onError: () => Alert.alert('Error', 'Failed to create proposal. Please try again.'),
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0" edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View className="mb-5">
            <FieldLabel label="Title" required />
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter a descriptive title for your research"
                  placeholderTextColor={colors.text.tertiary}
                  className={inputClass}
                  multiline
                  numberOfLines={2}
                  style={{ minHeight: 56, textAlignVertical: 'top' }}
                />
              )}
            />
            <FieldError message={errors.title?.message} />
          </View>

          {/* Research Field */}
          <View className="mb-5">
            <FieldLabel label="Research Field" required />
            <Controller
              control={control}
              name="researchField"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g. Artificial Intelligence, Blockchain"
                  placeholderTextColor={colors.text.tertiary}
                  className={inputClass}
                />
              )}
            />
            <FieldError message={errors.researchField?.message} />
          </View>

          {/* Abstract */}
          <View className="mb-5">
            <FieldLabel label="Abstract" required />
            <Controller
              control={control}
              name="abstract"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Briefly describe your research proposal (min. 50 characters)…"
                  placeholderTextColor={colors.text.tertiary}
                  className={inputClass}
                  multiline
                  numberOfLines={4}
                  style={{ minHeight: 100, textAlignVertical: 'top' }}
                />
              )}
            />
            <FieldError message={errors.abstract?.message} />
          </View>

          {/* Dates */}
          <View className="flex-row gap-3 mb-5">
            <View className="flex-1">
              <FieldLabel label="Start Date" required />
              <Controller
                control={control}
                name="startDate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.text.tertiary}
                    className={inputClass}
                  />
                )}
              />
              <FieldError message={errors.startDate?.message} />
            </View>
            <View className="flex-1">
              <FieldLabel label="End Date" required />
              <Controller
                control={control}
                name="endDate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.text.tertiary}
                    className={inputClass}
                  />
                )}
              />
              <FieldError message={errors.endDate?.message} />
            </View>
          </View>

          {/* Budget */}
          <View className="mb-5">
            <FieldLabel label="Total Budget (VND)" required />
            <Controller
              control={control}
              name="budget"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value === 0 ? '' : String(value)}
                  onChangeText={(t) => onChange(Number(t.replace(/[^0-9]/g, '')) || 0)}
                  onBlur={onBlur}
                  placeholder="e.g. 45000000"
                  placeholderTextColor={colors.text.tertiary}
                  className={inputClass}
                  keyboardType="numeric"
                />
              )}
            />
            <FieldError message={errors.budget?.message} />
          </View>

          {/* Objectives */}
          <View className="mb-5">
            <FieldLabel label="Objectives" required />
            <Controller
              control={control}
              name="objectives"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="What specific goals does this research aim to achieve?"
                  placeholderTextColor={colors.text.tertiary}
                  className={inputClass}
                  multiline
                  numberOfLines={3}
                  style={{ minHeight: 80, textAlignVertical: 'top' }}
                />
              )}
            />
            <FieldError message={errors.objectives?.message} />
          </View>

          {/* Methodology */}
          <View className="mb-5">
            <FieldLabel label="Methodology" required />
            <Controller
              control={control}
              name="methodology"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Describe your research approach and methods…"
                  placeholderTextColor={colors.text.tertiary}
                  className={inputClass}
                  multiline
                  numberOfLines={3}
                  style={{ minHeight: 80, textAlignVertical: 'top' }}
                />
              )}
            />
            <FieldError message={errors.methodology?.message} />
          </View>

          {/* Expected Outcomes */}
          <View className="mb-8">
            <FieldLabel label="Expected Outcomes" required />
            <Controller
              control={control}
              name="expectedOutcomes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="What are the expected deliverables or contributions?"
                  placeholderTextColor={colors.text.tertiary}
                  className={inputClass}
                  multiline
                  numberOfLines={3}
                  style={{ minHeight: 80, textAlignVertical: 'top' }}
                />
              )}
            />
            <FieldError message={errors.expectedOutcomes?.message} />
          </View>

          {/* Actions */}
          <Button
            label={isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Save as Draft'}
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
            onPress={handleSubmit(handleSave)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
