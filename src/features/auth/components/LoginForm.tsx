import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { useLogin } from '../hooks/useLogin';

const schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { t } = useTranslation('auth');
  const { colors } = useTheme();
  const { mutate: login, isPending, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(data: FormData) {
    login(data);
  }

  const apiErrorMessage = error ? error.message || t('loginFailed') : null;

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value, onBlur } }) => (
          <Input
            label={t('emailLabel')}
            placeholder={t('emailPlaceholder')}
            iconLeft={<Ionicons name="mail-outline" size={18} color={colors.icon.muted} />}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value, onBlur } }) => (
          <Input
            label={t('passwordLabel')}
            placeholder={t('passwordPlaceholder')}
            iconLeft={<Ionicons name="lock-closed-outline" size={18} color={colors.icon.muted} />}
            rightElement={
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.icon.muted}
                />
              </TouchableOpacity>
            }
            secureTextEntry={!showPassword}
            autoComplete="current-password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />

      {apiErrorMessage && (
        <View className="bg-red-100 dark:bg-red-700 rounded-lg px-4 py-3">
          <Text className="text-red-700 dark:text-red-100 text-sm font-sans text-center">
            {apiErrorMessage}
          </Text>
        </View>
      )}

      <Button
        label={isPending ? t('signingIn') : t('signIn')}
        onPress={handleSubmit(onSubmit)}
        loading={isPending}
        iconRight={!isPending ? <Ionicons name="arrow-forward" size={18} color="#fff" /> : undefined}
        size="lg"
        fullWidth
      />
    </View>
  );
}
