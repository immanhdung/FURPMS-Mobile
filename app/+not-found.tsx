import { View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0 items-center justify-center px-6">
        <View className="items-center gap-4">
          <Text className="text-neutral-900 dark:text-neutral-50 text-2xl font-bold">
            404
          </Text>
          <Text className="text-neutral-600 dark:text-dark-500 text-base text-center">
            This screen does not exist.
          </Text>
          <Link href="/" className="text-violet-500 dark:text-violet-400 text-base">
            Go home
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}
