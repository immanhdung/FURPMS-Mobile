import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { useChangePassword } from '@/features/profile/hooks/useProfile';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/utils/validators';

interface ChangePasswordSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function ChangePasswordSheet({ visible, onClose }: ChangePasswordSheetProps) {
  const { t } = useTranslation('profile');
  const { colors } = useTheme();
  const [apiError, setApiError] = useState<string | null>(null);
  const { mutate, isPending } = useChangePassword();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  function handleClose() {
    reset();
    setApiError(null);
    onClose();
  }

  function onSubmit(values: ChangePasswordFormValues) {
    setApiError(null);
    mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: handleClose,
        onError: (error) => {
          setApiError(error.message || t('changePasswordSheet.genericError'));
        },
      },
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/40">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <GlassSurface
            intensity={65}
            rounded={0}
            style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28, borderBottomWidth: 0 }}
            className="px-5 pt-5 pb-8 gap-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                {t('changePasswordSheet.title')}
              </Text>
              <TouchableOpacity onPress={handleClose} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.icon.muted} />
              </TouchableOpacity>
            </View>

            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('changePasswordSheet.currentPassword')}
                  secureTextEntry
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.currentPassword?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('changePasswordSheet.newPassword')}
                  secureTextEntry
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.newPassword?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('changePasswordSheet.confirmPassword')}
                  secureTextEntry
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            {apiError && (
              <Text className="text-sm font-sans text-red-500 dark:text-red-400">{apiError}</Text>
            )}

            <Button
              label={t('changePasswordSheet.submit')}
              onPress={handleSubmit(onSubmit)}
              loading={isPending}
              fullWidth
            />
          </GlassSurface>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
