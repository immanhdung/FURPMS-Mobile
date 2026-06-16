import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReviewNotificationsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      <View className="flex-1 items-center justify-center px-6 gap-3">
        <Text className="text-neutral-900 dark:text-neutral-50 text-2xl font-semibold">
          Notifications
        </Text>
        <Text className="text-neutral-600 dark:text-dark-500 text-sm text-center">
          Feature screens coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
}
