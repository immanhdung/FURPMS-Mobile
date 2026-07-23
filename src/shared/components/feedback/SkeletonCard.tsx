import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonLineProps {
  width?: string;
  height?: number;
}

function SkeletonLine({ width = 'w-full', height = 12 }: SkeletonLineProps) {
  return (
    <View
      className={`${width} bg-neutral-100 dark:bg-dark-100 rounded-md`}
      style={{ height }}
    />
  );
}

interface SkeletonCardProps {
  lines?: number;
}

export function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 900 }),
        withTiming(1, { duration: 900 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="bg-neutral-0 dark:bg-dark-50 rounded-xl p-4 gap-3 border border-neutral-100 dark:border-dark-200"
    >
      <SkeletonLine width="w-3/4" height={16} />
      {lines >= 2 && <SkeletonLine width="w-1/2" height={12} />}
      {lines >= 3 && (
        <View className="flex-row gap-2">
          <SkeletonLine width="w-16" height={22} />
          <SkeletonLine width="w-20" height={22} />
        </View>
      )}
    </Animated.View>
  );
}
