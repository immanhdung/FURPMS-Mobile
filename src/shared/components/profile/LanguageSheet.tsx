import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { useLocale, type Language } from '@/hooks/useLocale';

interface LanguageSheetProps {
  visible: boolean;
  onClose: () => void;
}

const OPTIONS: { code: Language; labelKey: 'english' | 'vietnamese' }[] = [
  { code: 'en', labelKey: 'english' },
  { code: 'vi', labelKey: 'vietnamese' },
];

export function LanguageSheet({ visible, onClose }: LanguageSheetProps) {
  const { colors } = useTheme();
  const { t } = useTranslation('profile');
  const { language, setLanguage } = useLocale();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <GlassSurface
          intensity={65}
          rounded={0}
          style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28, borderBottomWidth: 0 }}
          className="px-5 pt-5 pb-8 gap-2"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              {t('languageSheet.title')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.icon.muted} />
            </TouchableOpacity>
          </View>

          {OPTIONS.map((option) => {
            const selected = option.code === language;
            return (
              <TouchableOpacity
                key={option.code}
                onPress={() => {
                  setLanguage(option.code);
                  onClose();
                }}
                activeOpacity={0.7}
                className="flex-row items-center justify-between py-3.5 px-1"
              >
                <Text className="text-base font-sans text-neutral-900 dark:text-neutral-50">
                  {t(`languageSheet.${option.labelKey}`)}
                </Text>
                {selected && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.accent.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </GlassSurface>
      </View>
    </Modal>
  );
}
