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

export function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();

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
      </View>
    </KeyboardAvoidingView>
  );
}
