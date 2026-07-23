import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
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
  const { mutate: login, isPending, error } = useLogin();

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

  const apiErrorMessage = error ? error.message || 'Login failed. Please try again.' : null;

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
              label="Email"
              placeholder="name@fpt.edu.vn"
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
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
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
          label={isPending ? 'Signing in…' : 'Sign in'}
          onPress={handleSubmit(onSubmit)}
          loading={isPending}
          size="lg"
          fullWidth
        />

        {__DEV__ && (
          <View className="gap-2">
            <Text className="text-neutral-400 dark:text-dark-400 text-xs font-sans text-center">
              Quick sign in (dev only)
            </Text>
            <View className="flex-row flex-wrap gap-2 justify-center">
              {QUICK_LOGIN_ACCOUNTS.map((account) => (
                <Button
                  key={account.email}
                  label={account.label}
                  variant="outline"
                  size="sm"
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
