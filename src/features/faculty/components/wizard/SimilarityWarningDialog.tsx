import { Modal, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/shared/components/ui/Button';

interface SimilarityWarningDialogProps {
  visible: boolean;
  score: number;
  onDismiss: () => void;
}

export function SimilarityWarningDialog({ visible, score, onDismiss }: SimilarityWarningDialogProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onDismiss}>
      <View className="flex-1 items-center justify-center bg-black/40 px-8">
        <View className="bg-white dark:bg-dark-50 rounded-2xl p-5 gap-3 w-full">
          <View className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={22} color={colors.accent.warning} />
          </View>
          <Text className="text-neutral-900 dark:text-neutral-50 text-base font-semibold">Low similarity detected</Text>
          <Text className="text-neutral-600 dark:text-dark-400 text-sm font-sans leading-relaxed">
            The uploaded file does not appear to match the selected research topic (similarity score{' '}
            {Math.round(score * 100)}%). Do you want to continue submission anyway?
          </Text>
          <Button label="Got it, I'll continue" onPress={onDismiss} fullWidth />
        </View>
      </View>
    </Modal>
  );
}
