import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from "react-native-reanimated";

export default function AnimatedBlob({
  size = 200,
  color = "red",
  delay = 0,
  speed = 8000,
  startX = 0,
  startY = 0,
  rangeX = 100,
  rangeY = 100,
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(rangeX, { duration: speed }),
          withTiming(-rangeX, { duration: speed * 1.2 }),
          withTiming(0, { duration: speed * 0.8 })
        ),
        -1,
        true
      )
    );

    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-rangeY, { duration: speed * 1.1 }),
          withTiming(rangeY, { duration: speed * 0.9 }),
          withTiming(0, { duration: speed * 1.3 })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: speed * 0.7 }),
          withTiming(0.8, { duration: speed * 1.4 }),
          withTiming(1, { duration: speed * 0.9 })
        ),
        -1,
        true
      )
    );
  }, [delay, speed, rangeX, rangeY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.blob,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: startX,
          top: startY,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    opacity: 0.55,
  },
});
