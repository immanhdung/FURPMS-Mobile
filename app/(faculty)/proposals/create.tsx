import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useProposal, useCreateProposal, useUpdateProposal, useSubmitProposal } from '@/features/faculty/hooks/useProposals';
import { Button } from '@/shared/components/ui/Button';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { WizardStepper } from '@/features/faculty/components/wizard/WizardStepper';
import { Step1CycleFieldType } from '@/features/faculty/components/wizard/Step1CycleFieldType';
import { Step2ResearchContent } from '@/features/faculty/components/wizard/Step2ResearchContent';
import { Step3Details } from '@/features/faculty/components/wizard/Step3Details';
import { Step4TeamMembers } from '@/features/faculty/components/wizard/Step4TeamMembers';
import { Step5Preview } from '@/features/faculty/components/wizard/Step5Preview';
import { SubmitProposalSheet } from '@/features/faculty/components/SubmitProposalSheet';
import { proposalWizardSchema, type ProposalWizardFormValues } from '@/utils/validators';
import { uploadService, type PickedFile } from '@/services/upload.service';
import type { ProposalPayload } from '@/features/faculty/types/proposal.types';

const STEP_FIELDS: (keyof ProposalWizardFormValues)[][] = [
  ['cycleId', 'trackId', 'researchType'],
  [],
  ['titleVI', 'objectives', 'fundingMethod', 'durationMonths'],
  [],
  [],
];

const DEFAULT_VALUES: ProposalWizardFormValues = {
  cycleId: undefined as unknown as number,
  trackId: '',
  researchType: undefined as unknown as number,
  orderId: undefined,
  titleVI: '',
  titleEN: '',
  abstractEN: '',
  objectives: '',
  methodology: '',
  expectedOutput: '',
  urgency: '',
  novelty: '',
  applicationPotential: '',
  transferPotential: '',
  facilities: '',
  fundingMethod: 'WHOLE',
  durationMonths: 12,
  members: [],
};

export default function ProposalWizardScreen() {
  const { t } = useTranslation(['faculty', 'common']);
  const router = useRouter();
  const { edit: editId } = useLocalSearchParams<{ edit?: string }>();
  const { colors } = useTheme();
  const isEditing = !!editId;

  const [proposalId, setProposalId] = useState<string | null>(editId ?? null);
  const [currentStep, setCurrentStep] = useState(1);
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [documentAttached, setDocumentAttached] = useState(false);
  const [submitSheetVisible, setSubmitSheetVisible] = useState(false);

  const { data: existingProposal, isLoading: loadingExisting } = useProposal(editId ?? '');
  const { mutate: createProposal, isPending: isCreating } = useCreateProposal();
  const { mutate: updateProposal, isPending: isUpdating } = useUpdateProposal(proposalId ?? '');
  const { mutate: submitProposal, isPending: isSubmitting } = useSubmitProposal();

  const methods = useForm<ProposalWizardFormValues>({
    resolver: zodResolver(proposalWizardSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { trigger, handleSubmit, reset, getValues } = methods;

  useEffect(() => {
    if (!existingProposal) return;
    reset({
      cycleId: existingProposal.cycleId ?? (undefined as unknown as number),
      trackId: existingProposal.trackId ?? '',
      researchType: existingProposal.researchType,
      orderId: existingProposal.orderId ?? undefined,
      titleVI: existingProposal.titleVI ?? '',
      titleEN: existingProposal.titleEN ?? '',
      abstractEN: existingProposal.abstractEN ?? '',
      objectives: existingProposal.objectives ?? '',
      methodology: existingProposal.methodology ?? '',
      expectedOutput: existingProposal.expectedOutput ?? '',
      urgency: existingProposal.urgency ?? '',
      novelty: existingProposal.novelty ?? '',
      applicationPotential: existingProposal.applicationPotential ?? '',
      transferPotential: existingProposal.transferPotential ?? '',
      facilities: existingProposal.facilities ?? '',
      fundingMethod: (existingProposal.fundingMethod as 'WHOLE' | 'PARTIAL') ?? 'WHOLE',
      durationMonths: existingProposal.durationMonths ?? 12,
      members: (existingProposal.members ?? []).map((m) => ({
        fullName: m.fullName,
        email: m.email,
        department: m.department ?? undefined,
        role: m.role ?? undefined,
        workMonths: m.workMonths,
        academicTitle: m.academicTitle ?? undefined,
        memberRoleCode: m.memberRoleCode ?? undefined,
        isSecretary: m.isSecretary,
      })),
    });
    setDocumentAttached(true); // an existing proposal may already have documents; don't re-attach automatically
  }, [existingProposal, reset]);

  const isPending = isCreating || isUpdating;

  async function attachPickedFileIfNeeded(targetProposalId: string) {
    if (!pickedFile || documentAttached) return;
    try {
      await uploadService.uploadProposalDocument(targetProposalId, pickedFile);
      setDocumentAttached(true);
    } catch {
      Alert.alert(t('proposalWizard.documentNotAttachedTitle'), t('proposalWizard.documentNotAttachedMessage'));
    }
  }

  function toPayload(values: ProposalWizardFormValues): ProposalPayload {
    return {
      cycleId: values.cycleId,
      orderId: values.orderId,
      trackId: values.trackId,
      titleVI: values.titleVI,
      titleEN: values.titleEN || undefined,
      researchType: values.researchType,
      durationMonths: values.durationMonths,
      objectives: values.objectives,
      methodology: values.methodology || undefined,
      expectedOutput: values.expectedOutput || undefined,
      abstractEN: values.abstractEN || undefined,
      urgency: values.urgency || undefined,
      novelty: values.novelty || undefined,
      applicationPotential: values.applicationPotential || undefined,
      transferPotential: values.transferPotential || undefined,
      facilities: values.facilities || undefined,
      fundingMethod: values.fundingMethod,
      members: values.members,
    };
  }

  function saveDraft(onDone?: (id: string) => void) {
    const payload = toPayload(getValues());
    if (proposalId) {
      updateProposal(payload, {
        onSuccess: async () => {
          await attachPickedFileIfNeeded(proposalId);
          onDone?.(proposalId);
        },
        onError: () => Alert.alert(t('common:states.errorTitle'), t('proposalWizard.saveErrorMessage')),
      });
    } else {
      createProposal(payload, {
        onSuccess: async (created) => {
          setProposalId(created.id);
          await attachPickedFileIfNeeded(created.id);
          onDone?.(created.id);
        },
        onError: () => Alert.alert(t('common:states.errorTitle'), t('proposalWizard.createErrorMessage')),
      });
    }
  }

  async function handleNext() {
    const fields = STEP_FIELDS[currentStep - 1];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    if (currentStep < 5) {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  }

  function handleSaveDraft() {
    saveDraft(() => {
      Alert.alert(t('proposalWizard.draftSavedTitle'), t('proposalWizard.draftSavedMessage'));
    });
  }

  function handleSubmitProposal(confirmCv: boolean) {
    saveDraft((id) => {
      submitProposal(
        { id, confirmCv },
        {
          onSuccess: () => {
            setSubmitSheetVisible(false);
            router.replace(`/(faculty)/proposals/${id}`);
          },
          onError: () => Alert.alert(t('common:states.errorTitle'), t('proposalWizard.submitErrorMessage')),
        },
      );
    });
  }

  if (isEditing && loadingExisting) return <LoadingState message={t('proposalWizard.loading')} />;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0" edges={['bottom']}>
      <FormProvider {...methods}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <WizardStepper currentStep={currentStep} />
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {currentStep === 1 && <Step1CycleFieldType />}
            {currentStep === 2 && <Step2ResearchContent pickedFile={pickedFile} onPickedFileChange={(f) => { setPickedFile(f); setDocumentAttached(false); }} />}
            {currentStep === 3 && <Step3Details />}
            {currentStep === 4 && <Step4TeamMembers />}
            {currentStep === 5 && <Step5Preview />}
          </ScrollView>

          <View
            className="px-5 pt-3 border-t border-neutral-100 dark:border-dark-200 bg-neutral-50 dark:bg-dark-0 gap-3"
            style={{ paddingBottom: 76 }}
          >
            <View className="flex-row gap-3">
              {currentStep > 1 && (
                <TouchableOpacity
                  onPress={handleBack}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-center px-4 py-3 rounded-xl border border-neutral-200 dark:border-dark-200"
                >
                  <Ionicons name="chevron-back" size={18} color={colors.icon.default} />
                </TouchableOpacity>
              )}
              <Button label={t('proposalWizard.saveDraft')} variant="secondary" onPress={handleSaveDraft} loading={isPending} />
              <View className="flex-1">
                {currentStep < 5 ? (
                  <Button label={t('proposalWizard.next')} onPress={handleNext} fullWidth />
                ) : (
                  <Button label={t('proposalWizard.reviewAndSubmit')} onPress={() => setSubmitSheetVisible(true)} fullWidth />
                )}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </FormProvider>

      <SubmitProposalSheet
        visible={submitSheetVisible}
        isSubmitting={isSubmitting || isPending}
        onClose={() => setSubmitSheetVisible(false)}
        onConfirm={handleSubmitProposal}
      />
    </SafeAreaView>
  );
}
