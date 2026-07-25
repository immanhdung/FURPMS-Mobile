import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

interface DeclineInvitationDialogProps {
  visible: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

export function DeclineInvitationDialog({ visible, isSubmitting, onClose, onConfirm }: DeclineInvitationDialogProps) {
  const { t } = useTranslation('reviewer');
  const { colors } = useTheme();
  const [reason, setReason] = useState('');

  function handleClose() {
    setReason('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white dark:bg-dark-50 rounded-t-3xl px-5 pt-5 pb-8 gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{t('declineDialog.title')}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.icon.muted} />
            </TouchableOpacity>
          </View>
          <Input
            label={t('declineDialog.reasonLabel')}
            placeholder={t('declineDialog.reasonPlaceholder')}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
          />
          <Button
            label={t('declineDialog.confirmButton')}
            variant="danger"
            onPress={() => onConfirm(reason.trim() || undefined)}
            loading={isSubmitting}
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}
