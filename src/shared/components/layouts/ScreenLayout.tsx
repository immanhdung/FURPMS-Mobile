import { SafeAreaView, ScrollView, RefreshControl, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padding?: boolean;
}

export function ScreenLayout({
  children,
  scrollable = true,
  refreshing = false,
  onRefresh,
  padding = true,
}: ScreenLayoutProps) {
  const { colors } = useTheme();

  if (!scrollable) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
        <View className={padding ? 'flex-1 px-4' : 'flex-1'}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: padding ? 16 : 0,
          paddingBottom: 32,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.primary}
              colors={[colors.accent.primary]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
