import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/shared/components/ui/Button';

interface SubmitProposalSheetProps {
  visible: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (confirmCv: boolean) => void;
}

export function SubmitProposalSheet({ visible, isSubmitting, onClose, onConfirm }: SubmitProposalSheetProps) {
  const { t } = useTranslation('faculty');
  const { colors } = useTheme();
  const [confirmCv, setConfirmCv] = useState(false);

  function handleClose() {
    setConfirmCv(false);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white dark:bg-dark-50 rounded-t-3xl px-5 pt-5 pb-8 gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{t('submitProposalSheet.title')}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.icon.muted} />
            </TouchableOpacity>
          </View>

          <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans leading-relaxed">
            {t('submitProposalSheet.description')}
          </Text>

          <TouchableOpacity
            onPress={() => setConfirmCv((v) => !v)}
            activeOpacity={0.7}
            className="flex-row items-start gap-3 bg-neutral-50 dark:bg-dark-100 rounded-xl p-3"
          >
            <View
              className={`w-5 h-5 rounded-md border items-center justify-center mt-0.5 ${
                confirmCv ? 'bg-violet-500 border-violet-500' : 'border-neutral-300 dark:border-dark-300'
              }`}
            >
              {confirmCv && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text className="flex-1 text-neutral-700 dark:text-neutral-200 text-sm font-sans leading-relaxed">
              {t('submitProposalSheet.cvConfirmText')}
            </Text>
          </TouchableOpacity>

          <Button label={t('submitProposalSheet.submitForReview')} onPress={() => onConfirm(confirmCv)} loading={isSubmitting} fullWidth />
        </View>
      </View>
    </Modal>
  );
}
