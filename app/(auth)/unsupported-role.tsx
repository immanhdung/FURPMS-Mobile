import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { Button } from '@/shared/components/ui/Button';

export default function UnsupportedRoleScreen() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { colors } = useTheme();
  const { mutate: logout, isPending } = useLogout();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0 items-center justify-center px-8">
      <View className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-dark-200 items-center justify-center mb-5">
        <Ionicons name="phone-portrait-outline" size={28} color={colors.icon.muted} />
      </View>
      <Text className="text-neutral-900 dark:text-neutral-50 text-xl font-bold text-center">
        {t('unsupportedRole.title')}
      </Text>
      <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans text-center mt-2 leading-relaxed">
        {user?.roles?.length
          ? t('unsupportedRole.bodyWithRoles', { roles: user.roles.join(', ') })
          : t('unsupportedRole.bodyNoRoles')}
      </Text>
      <Button
        label={isPending ? t('unsupportedRole.signingOut') : t('unsupportedRole.signOut')}
        variant="secondary"
        onPress={() => logout()}
        loading={isPending}
        className="mt-6"
      />
    </SafeAreaView>
  );
}
