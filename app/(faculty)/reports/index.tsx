import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { EmptyState } from '@/shared/components/feedback/EmptyState';

// TODO(phase-2-reports): replace with the real contract picker + Progress/Final report screens.
export default function ReportsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      <View className="px-5 pt-6 pb-4">
        <Text className="text-neutral-900 dark:text-neutral-50 text-2xl font-bold tracking-tight">
          Reports
        </Text>
      </View>
      <EmptyState
        icon="📊"
        title="Reports coming soon"
        description="Progress and final report submission will appear here once your proposal is approved and a contract is signed."
      />
    </SafeAreaView>
  );
}
