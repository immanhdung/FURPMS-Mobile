import { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { videoMeetingService } from '@/services/video-meeting.service';
import { useTheme } from '@/hooks/useTheme';

interface VideoMeetingButtonProps {
  videoUrl: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline';
  fullWidth?: boolean;
}

export function VideoMeetingButton({
  videoUrl,
  size = 'md',
  variant = 'primary',
  fullWidth = false,
}: VideoMeetingButtonProps) {
  const { colors, isDark } = useTheme();
  const [isJoining, setIsJoining] = useState(false);

  const platformInfo = videoMeetingService.getPlatformInfo(videoUrl);

  const sizeStyles = {
    sm: { paddingH: 12, paddingV: 8, iconSize: 16, fontSize: 13, borderRadius: 10 },
    md: { paddingH: 16, paddingV: 12, iconSize: 18, fontSize: 15, borderRadius: 12 },
    lg: { paddingH: 20, paddingV: 14, iconSize: 20, fontSize: 16, borderRadius: 14 },
  }[size];

  async function handleJoin() {
    setIsJoining(true);
    try {
      await videoMeetingService.join({ url: videoUrl, preferNativeApp: true });
    } catch (err) {
      Alert.alert(
        'Cannot Open Meeting',
        'The meeting link could not be opened. Please copy the link manually.',
      );
    } finally {
      setIsJoining(false);
    }
  }

  const isPrimary = variant === 'primary';
  const bgColor = isPrimary ? platformInfo.color : 'transparent';
  const textColor = isPrimary ? '#ffffff' : platformInfo.color;
  const borderColor = platformInfo.color;

  return (
    <TouchableOpacity
      onPress={handleJoin}
      activeOpacity={0.75}
      disabled={isJoining}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor,
          borderWidth: isPrimary ? 0 : 1.5,
          paddingHorizontal: sizeStyles.paddingH,
          paddingVertical: sizeStyles.paddingV,
          borderRadius: sizeStyles.borderRadius,
          alignSelf: fullWidth ? undefined : 'flex-start',
          width: fullWidth ? '100%' : undefined,
          opacity: isJoining ? 0.7 : 1,
        },
      ]}
    >
      {isJoining ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Ionicons
          name={platformInfo.icon as React.ComponentProps<typeof Ionicons>['name']}
          size={sizeStyles.iconSize}
          color={textColor}
        />
      )}
      <Text style={[styles.label, { color: textColor, fontSize: sizeStyles.fontSize }]}>
        {isJoining ? 'Joining…' : `Join ${platformInfo.label}`}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: { fontWeight: '600' },
});
