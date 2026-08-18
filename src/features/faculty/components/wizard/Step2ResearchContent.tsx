import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PickerField } from '@/shared/components/ui/PickerField';
import { FileUploader } from '@/shared/components/upload/FileUploader';
import { Button } from '@/shared/components/ui/Button';
import { useResearchTypes } from '@/features/faculty/hooks/useResearchTypes';
import { useResearchOrders } from '@/features/faculty/hooks/useResearchOrders';
import { useExtractProposalMutation } from '@/features/faculty/hooks/useProposalAi';
import { uploadService, type PickedFile } from '@/services/upload.service';
import type { ProposalWizardFormValues } from '@/utils/validators';

interface Step2ResearchContentProps {
  pickedFile: PickedFile | null;
  onPickedFileChange: (file: PickedFile | null) => void;
  /** Called after a successful extraction so the wizard can jump the PI straight to the filled-in step 3. */
  onExtracted?: () => void;
}

export function Step2ResearchContent({ pickedFile, onPickedFileChange, onExtracted }: Step2ResearchContentProps) {
  const { t } = useTranslation(['faculty', 'common']);
  const { control, watch, setValue } = useFormContext<ProposalWizardFormValues>();
  const cycleId = watch('cycleId');
  const researchTypeId = watch('researchType');

  const { data: researchTypes } = useResearchTypes();
  const selectedType = researchTypes?.find((t) => t.id === researchTypeId);
  const isApplied = !!selectedType?.requireOrderingUnit;

  const { data: orders, isLoading: ordersLoading } = useResearchOrders({ cycleId });

  const [isPicking, setIsPicking] = useState(false);

  const extractMutation = useExtractProposalMutation();

  async function handlePick() {
    setIsPicking(true);
    try {
      const file = await uploadService.pickFile();
      if (file) onPickedFileChange(file);
    } finally {
      setIsPicking(false);
    }
  }

  // Gemini extracts whatever it finds in the uploaded document; fields it didn't find are absent
  // from the result, so those form fields are simply left untouched (blank) for the PI to fill in.
  function handleAnalyze() {
    if (!pickedFile) return;
    extractMutation.mutate(pickedFile, {
      onSuccess: (result) => {
        if (result.titleEn) setValue('titleEN', result.titleEn.trim(), { shouldValidate: true });
        if (result.titleVi) setValue('titleVI', result.titleVi.trim(), { shouldValidate: true });
        if (result.abstractVi) setValue('abstractEN', result.abstractVi.trim(), { shouldValidate: true });
        if (result.researchObjectives) setValue('objectives', result.researchObjectives.trim(), { shouldValidate: true });
        if (result.methodology) setValue('methodology', result.methodology.trim());
        if (result.expectedOutput) setValue('expectedOutput', result.expectedOutput.trim());
        if (result.durationMonths) setValue('durationMonths', result.durationMonths, { shouldValidate: true });
        onExtracted?.();
      },
      onError: (error) => {
        Alert.alert(t('common:states.errorTitle'), error.message || t('step2.extractErrorMessage'));
      },
    });
  }

  return (
    <View className="gap-5">
      {isApplied ? (
        <Controller
          control={control}
          name="orderId"
          render={({ field: { value, onChange } }) => (
            <PickerField
              label={t('step2.researchTopic')}
              required
              placeholder={ordersLoading ? t('step1.loading') : t('step2.selectImportedTopic')}
              value={value}
              options={(orders ?? []).map((o) => ({ value: o.id, label: o.researchArea, description: o.problemDescription ?? undefined }))}
              onChange={onChange}
              emptyMessage={t('step2.noResearchTopics')}
            />
          )}
        />
      ) : null}

      <View className="gap-2">
        <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {t('step2.proposalDocument')}
        </Text>
        <FileUploader
          pickedFile={pickedFile}
          uploadedFile={null}
          isPickingFile={isPicking}
          isUploading={false}
          progress={null}
          error={null}
          onPick={handlePick}
          onRemove={() => onPickedFileChange(null)}
          label={t('step2.uploadProposalDocument')}
          hint={t('step2.uploadHint')}
        />
      </View>

      {pickedFile && (
        <Button
          label={extractMutation.isPending ? t('step2.analyzing') : t('step2.analyzeWithAi')}
          variant="secondary"
          onPress={handleAnalyze}
          loading={extractMutation.isPending}
          fullWidth
        />
      )}
    </View>
  );
}
