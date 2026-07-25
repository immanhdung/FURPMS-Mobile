import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
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

const QUICK_LOGIN_ACCOUNTS: { label: string; email: string; password: string }[] = [
  { label: 'PI', email: 'pi.demo@furpms.edu.vn', password: 'Faculty@123456' },
  { label: 'Reviewer 1', email: 'reviewer1.demo@furpms.edu.vn', password: 'Reviewer@123456' },
  { label: 'Reviewer 2', email: 'reviewer2.demo@furpms.edu.vn', password: 'Reviewer@123456' },
  { label: 'Reviewer 3', email: 'reviewer3.demo@furpms.edu.vn', password: 'Reviewer@123456' },
];

export function LoginForm() {
  const { t } = useTranslation('auth');
  const { colors } = useTheme();
  const { mutate: login, isPending, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(data: FormData) {
    login(data);
  }

  function handleQuickLogin(account: (typeof QUICK_LOGIN_ACCOUNTS)[number]) {
    setValue('email', account.email, { shouldValidate: true });
    setValue('password', account.password, { shouldValidate: true });
  }

  const apiErrorMessage = error ? error.message || t('loginFailed') : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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

        {__DEV__ && (
          <View
            className="gap-2.5 rounded-xl border border-dashed border-neutral-200 dark:border-dark-200 px-3 py-3"
          >
            <View className="flex-row items-center justify-center gap-1.5">
              <Ionicons name="flask-outline" size={13} color={colors.icon.muted} />
              <Text className="text-neutral-400 dark:text-dark-400 text-xs font-sans">
                {t('quickSignInDev')}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2 justify-center">
              {QUICK_LOGIN_ACCOUNTS.map((account) => (
                <Button
                  key={account.email}
                  label={account.label}
                  variant="outline"
                  size="sm"
                  iconLeft={<Ionicons name="person-circle-outline" size={14} color={colors.accent.primary} />}
                  onPress={() => handleQuickLogin(account)}
                  disabled={isPending}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
