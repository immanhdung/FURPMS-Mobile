import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder — LoginScreen will be built in the auth feature
export default function LoginRoute() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-dark-0 items-center justify-center px-6">
      <View className="w-full max-w-sm gap-6 items-center">
        <View className="items-center gap-2">
          <Text className="text-neutral-900 dark:text-neutral-50 text-3xl font-bold tracking-tight">
            FURPMS
          </Text>
          <Text className="text-neutral-600 dark:text-dark-500 text-base">
            FPT University Research Portal
          </Text>
        </View>
        <View className="w-full bg-neutral-100 dark:bg-dark-100 rounded-xl p-4">
          <Text className="text-neutral-600 dark:text-dark-500 text-sm text-center">
            Login screen — coming soon
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
