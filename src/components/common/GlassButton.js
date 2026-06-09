import React from "react";
import {
  StyleSheet,
  Text,
  Pressable,
  ActivityIndicator,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function GlassButton({
  onPress,
  text,
  type = "primary", // 'primary' (gradient) | 'glass' (translucent glass)
  loading = false,
  disabled = false,
  icon,
  style,
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.96, { damping: 12, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={COLORS.textLight}
          style={styles.spinner}
        />
      );
    }

    return (
      <View style={styles.contentContainer}>
        {icon && (
          <View style={styles.icon}>
            {typeof icon === "string" ? (
              <Feather name={icon} size={18} color={COLORS.textLight} />
            ) : (
              icon
            )}
          </View>
        )}
        <Text style={styles.text}>{text}</Text>
      </View>
    );
  };

  if (type === "primary") {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[styles.pressable, animatedStyle, style]}
      >
        <LinearGradient
          colors={["#F37021", "#EC4899"]} // Beautiful FPT Orange to Pink gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  // type === 'glass'
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.pressable,
        styles.buttonGlass,
        animatedStyle,
        disabled && styles.disabled,
        style,
      ]}
    >
      {renderContent()}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 8,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  icon: {
    marginRight: 10,
  },
  spinner: {
    padding: 4,
  },
  disabled: {
    opacity: 0.5,
  },
});
