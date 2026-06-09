import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { COLORS } from "../../constants/colors";

export default function GlassCard({
  children,
  style,
  intensity = 40,
  tint = "light",
}) {
  return (
    <View style={[styles.containerShadow, style]}>
      <BlurView intensity={intensity} tint={tint} style={styles.blurContainer}>
        <View style={styles.innerContainer}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerShadow: {
    borderRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.glassCardShadow,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
        // Adding shadow for Android
        shadowColor: COLORS.glassCardShadow,
      },
      web: {
        boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.25)",
      },
    }),
  },
  blurContainer: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
    backgroundColor: Platform.select({
      ios: "rgba(255, 255, 255, 0.08)",
      android: "rgba(255, 255, 255, 0.18)", // Frosted fallback for Android
      default: "rgba(255, 255, 255, 0.12)",
    }),
  },
  innerContainer: {
    padding: 24,
  },
});
