import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { Button } from '@/shared/components/ui/Button';

export default function UnsupportedRoleScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { mutate: logout, isPending } = useLogout();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0 items-center justify-center px-8">
      <View className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-dark-200 items-center justify-center mb-5">
        <Ionicons name="phone-portrait-outline" size={28} color={colors.icon.muted} />
      </View>
      <Text className="text-neutral-900 dark:text-neutral-50 text-xl font-bold text-center">
        Not available on mobile
      </Text>
      <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans text-center mt-2 leading-relaxed">
        {user?.roles?.length
          ? `Your account (${user.roles.join(', ')}) doesn't have a Faculty or Review Committee role. This app only supports those roles — please use the FURPMS web app instead.`
          : 'This app only supports the Faculty and Review Committee roles. Please use the FURPMS web app instead.'}
      </Text>
      <Button
        label={isPending ? 'Signing out…' : 'Sign Out'}
        variant="secondary"
        onPress={() => logout()}
        loading={isPending}
        className="mt-6"
      />
    </SafeAreaView>
  );
}
