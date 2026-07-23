import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useChangePassword } from '@/features/profile/hooks/useProfile';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/utils/validators';

interface ChangePasswordSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function ChangePasswordSheet({ visible, onClose }: ChangePasswordSheetProps) {
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
          const message = (error as { message?: string })?.message;
          setApiError(message ?? 'Could not change password. Please try again.');
        },
      },
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/40">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="bg-white dark:bg-dark-50 rounded-t-3xl px-5 pt-5 pb-8 gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Change Password
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
                  label="Current password"
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
                  label="New password"
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
                  label="Confirm new password"
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
              label="Update Password"
              onPress={handleSubmit(onSubmit)}
              loading={isPending}
              fullWidth
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
