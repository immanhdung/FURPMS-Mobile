import { useState } from 'react';
import { View, Text } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PickerField } from '@/shared/components/ui/PickerField';
import { FileUploader } from '@/shared/components/upload/FileUploader';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { useResearchTypes } from '@/features/faculty/hooks/useResearchTypes';
import { useResearchOrders } from '@/features/faculty/hooks/useResearchOrders';
import { useExtractProposalMutation, useSimilarityCheckMutation } from '@/features/faculty/hooks/useProposalAi';
import { uploadService, type PickedFile } from '@/services/upload.service';
import { SimilarityWarningDialog } from './SimilarityWarningDialog';
import type { ProposalWizardFormValues } from '@/utils/validators';

interface Step2ResearchContentProps {
  pickedFile: PickedFile | null;
  onPickedFileChange: (file: PickedFile | null) => void;
}

export function Step2ResearchContent({ pickedFile, onPickedFileChange }: Step2ResearchContentProps) {
  const { t } = useTranslation('faculty');
  const { control, watch, setValue } = useFormContext<ProposalWizardFormValues>();
  const cycleId = watch('cycleId');
  const researchTypeId = watch('researchType');

  const { data: researchTypes } = useResearchTypes();
  const selectedType = researchTypes?.find((t) => t.id === researchTypeId);
  const isApplied = !!selectedType?.requireOrderingUnit;

  const { data: orders, isLoading: ordersLoading } = useResearchOrders({ cycleId });

  const [isPicking, setIsPicking] = useState(false);
  const [similarityResult, setSimilarityResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [warningVisible, setWarningVisible] = useState(false);

  const extractMutation = useExtractProposalMutation();
  const similarityMutation = useSimilarityCheckMutation();

  async function handlePick() {
    setIsPicking(true);
    try {
      const file = await uploadService.pickFile();
      if (file) onPickedFileChange(file);
    } finally {
      setIsPicking(false);
    }
  }

  function handleAnalyze() {
    if (!pickedFile) return;
    extractMutation.mutate(pickedFile, {
      onSuccess: (result) => {
        setValue('titleEN', result.titleEN, { shouldValidate: true });
        if (result.titleVI) setValue('titleVI', result.titleVI, { shouldValidate: true });
        setValue('abstractEN', result.abstractEN, { shouldValidate: true });
      },
    });
  }

  function handleCheckSimilarity() {
    const topicId = watch('orderId');
    if (!pickedFile || !topicId) return;
    similarityMutation.mutate(
      { file: pickedFile, topicId },
      {
        onSuccess: (result) => {
          setSimilarityResult(result);
          if (!result.passed) setWarningVisible(true);
        },
      },
    );
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
              options={(orders ?? []).map((o) => ({ value: o.id, label: o.title, description: o.description ?? undefined }))}
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
          onRemove={() => {
            onPickedFileChange(null);
            setSimilarityResult(null);
          }}
          label={t('step2.uploadProposalDocument')}
          hint={t('step2.uploadHint')}
        />
      </View>

      {!isApplied && pickedFile && (
        <Button
          label={extractMutation.isPending ? t('step2.analyzing') : t('step2.analyzeWithAi')}
          variant="secondary"
          onPress={handleAnalyze}
          loading={extractMutation.isPending}
          fullWidth
        />
      )}

      {isApplied && pickedFile && watch('orderId') && (
        <View className="gap-2">
          <Button
            label={similarityMutation.isPending ? t('step2.checking') : t('step2.checkSimilarity')}
            variant="secondary"
            onPress={handleCheckSimilarity}
            loading={similarityMutation.isPending}
            fullWidth
          />
          {similarityResult && (
            <View className="flex-row items-center gap-2">
              <Badge
                label={t('step2.similarityLabel', { percent: Math.round(similarityResult.score * 100) })}
                variant={similarityResult.passed ? 'success' : 'warning'}
              />
            </View>
          )}
        </View>
      )}

      <SimilarityWarningDialog
        visible={warningVisible}
        score={similarityResult?.score ?? 0}
        onDismiss={() => setWarningVisible(false)}
      />
    </View>
  );
}
