import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Controller } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";

export default function GlassInput({
  control,
  name,
  rules,
  label,
  placeholder,
  icon,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View style={styles.container}>
          {label && <Text style={styles.label}>{label}</Text>}
          <View
            style={[
              styles.inputWrapper,
              isFocused && styles.inputWrapperFocused,
              error && styles.inputWrapperError,
            ]}
          >
            {icon && (
              <Feather
                name={icon}
                size={20}
                color={
                  error
                    ? COLORS.danger
                    : isFocused
                      ? COLORS.textLight
                      : COLORS.textMuted
                }
                style={styles.iconLeft}
              />
            )}
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={() => {
                onBlur();
                setIsFocused(false);
              }}
              onFocus={() => setIsFocused(true)}
              placeholder={placeholder}
              placeholderTextColor={COLORS.textPlaceholder}
              secureTextEntry={isSecure}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              style={styles.textInput}
            />
            {secureTextEntry && (
              <TouchableOpacity
                onPress={() => setIsSecure(!isSecure)}
                activeOpacity={0.6}
                style={styles.iconRightWrapper}
              >
                <Feather
                  name={isSecure ? "eye-off" : "eye"}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: "100%",
  },
  label: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.glassInputBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: COLORS.glassInputFocusBorder,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  inputWrapperError: {
    borderColor: "rgba(239, 68, 68, 0.6)",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
  iconLeft: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 16,
    height: "100%",
  },
  iconRightWrapper: {
    padding: 4,
  },
  errorText: {
    color: "#FDA4AF", // soft light red/pink for better readability on dark gradients
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
    marginLeft: 4,
  },
});
