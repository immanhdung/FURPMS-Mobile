import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { useForm } from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome, Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from "react-native-reanimated";

import { COLORS } from "../../constants/colors";
import AnimatedBlob from "../../components/common/AnimatedBlob";
import GlassCard from "../../components/common/GlassCard";
import GlassInput from "../../components/common/GlassInput";
import GlassButton from "../../components/common/GlassButton";

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Entry animation values
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(50);
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered entry animation
    cardOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    cardTranslateY.value = withDelay(
      300,
      withSpring(0, { damping: 15, stiffness: 100 })
    );

    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withSpring(1, { damping: 10, stiffness: 120 });
  }, [cardOpacity, cardTranslateY, logoOpacity, logoScale]);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      opacity: cardOpacity.value,
      transform: [{ translateY: cardTranslateY.value }],
    };
  });

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: logoScale.value }],
    };
  });

  const onLoginSubmit = async (data) => {
    // Mock authentication process
    return new Promise((resolve) => {
      setTimeout(() => {
        Alert.alert(
          "Đăng nhập thành công",
          `Chào mừng ${data.username} quay trở lại hệ thống quản lý dự án FURPMS!`,
          [
            {
              text: "OK",
              onPress: () => {
                reset();
                resolve();
              },
            },
          ]
        );
      }, 1500);
    });
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      "Đăng nhập FPT Account",
      "Hệ thống đang chuyển hướng tới trang đăng nhập Google Single Sign-On..."
    );
  };

  return (
    <LinearGradient
      colors={["#0B0F19", "#111827", "#1E1B4B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* 1. LIQUID FLUID BACKGROUND ANIMATIONS */}
      <View style={StyleSheet.absoluteFill}>
        {/* Top left orange blob (FPT Brand Color) */}
        <AnimatedBlob
          size={280}
          color="rgba(243, 112, 33, 0.45)"
          startX={-50}
          startY={50}
          speed={9000}
          rangeX={60}
          rangeY={80}
        />
        {/* Middle right royal purple blob */}
        <AnimatedBlob
          size={320}
          color="rgba(139, 92, 246, 0.4)"
          startX={250}
          startY={250}
          speed={11000}
          delay={1000}
          rangeX={80}
          rangeY={60}
        />
        {/* Bottom left vibrant cyan blob */}
        <AnimatedBlob
          size={260}
          color="rgba(6, 182, 212, 0.35)"
          startX={-40}
          startY={550}
          speed={10000}
          delay={500}
          rangeX={70}
          rangeY={70}
        />
      </View>

      {/* 2. MAIN SCROLL CONTAINER */}
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 3. LOGO & BRANDING */}
            <Animated.View style={[styles.brandContainer, animatedLogoStyle]}>
              <View style={styles.logoOuterGlow}>
                <View style={styles.logoContainer}>
                  <Feather name="award" size={32} color={COLORS.fptOrange} />
                </View>
              </View>
              <Text style={styles.brandTitle}>FPT UNIVERSITY</Text>
              <Text style={styles.brandSubtitle}>
                Research Project Management System
              </Text>
            </Animated.View>

            {/* 4. FROSTED GLASS LOGIN CARD */}
            <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
              <GlassCard intensity={45}>
                <Text style={styles.cardHeader}>Đăng Nhập</Text>
                <Text style={styles.cardHeaderDesc}>
                  Vui lòng sử dụng tài khoản được cấp để tiếp tục
                </Text>

                {/* Form Inputs */}
                <GlassInput
                  control={control}
                  name="username"
                  rules={{
                    required: "Tên đăng nhập không được để trống",
                    minLength: {
                      value: 3,
                      message: "Tên đăng nhập tối thiểu 3 ký tự",
                    },
                  }}
                  label="Tên đăng nhập"
                  placeholder="Nhập tên đăng nhập"
                  icon="user"
                />

                <GlassInput
                  control={control}
                  name="password"
                  rules={{
                    required: "Mật khẩu không được để trống",
                    minLength: {
                      value: 6,
                      message: "Mật khẩu tối thiểu 6 ký tự",
                    },
                  }}
                  label="Mật khẩu"
                  placeholder="Nhập mật khẩu"
                  icon="lock"
                  secureTextEntry={true}
                />

                {/* Forgot Password Link */}
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={styles.forgotPasswordContainer}
                >
                  <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                {/* Submit Button */}
                <GlassButton
                  text="ĐĂNG NHẬP"
                  type="primary"
                  loading={isSubmitting}
                  onPress={handleSubmit(onLoginSubmit)}
                  style={styles.submitButton}
                />

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>hoặc</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* SSO Login Button */}
                <GlassButton
                  text="Tài khoản Google"
                  type="glass"
                  icon={
                    <FontAwesome
                      name="google"
                      size={18}
                      color={COLORS.textLight}
                    />
                  }
                  onPress={handleGoogleLogin}
                  style={styles.ssoButton}
                />
              </GlassCard>
            </Animated.View>

            {/* Footer copyright */}
            <Text style={styles.footerText}>
              &copy; {new Date().getFullYear()} FURPMS. All rights
              reserved.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 40 : 60,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoOuterGlow: {
    padding: 3,
    borderRadius: 24,
    backgroundColor: "rgba(243, 112, 33, 0.2)",
    shadowColor: COLORS.fptOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    marginBottom: 16,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.textLight,
    letterSpacing: 2,
    textAlign: "center",
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textMuted,
    marginTop: 4,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  cardContainer: {
    width: "100%",
  },
  cardHeader: {
    color: COLORS.textLight,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  cardHeaderDesc: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 16,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginHorizontal: 16,
    textTransform: "lowercase",
  },
  ssoButton: {
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 40,
  },
});