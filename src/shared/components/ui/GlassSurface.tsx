import { View, StyleSheet, type StyleProp, type ViewStyle, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';

interface GlassSurfaceProps extends Omit<ViewProps, 'style' | 'className'> {
  /** Blur strength, 0-100. Higher reads "thicker" glass. */
  intensity?: number;
  tint?: 'light' | 'dark' | 'auto';
  rounded?: number;
  /** Applied to the inner content wrapper (padding, gap, etc.) — the outer BlurView owns radius/border. */
  className?: string;
  /** Applied to the outer BlurView (flex, margin, explicit size...). */
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Frosted "liquid glass" container: blurred backdrop + translucent tint + hairline light border +
 * a soft diagonal highlight, mimicking iOS's Liquid Glass material. Use in place of a flat
 * `bg-white dark:bg-dark-50` card wherever the surface sits over other content (screens, photos).
 */
export function GlassSurface({
  intensity = 40,
  tint = 'auto',
  rounded = 24,
  className = '',
  style,
  children,
  ...rest
}: GlassSurfaceProps) {
  const { isDark } = useTheme();
  const resolvedTint = tint === 'auto' ? (isDark ? 'dark' : 'light') : tint;

  return (
    <BlurView
      intensity={intensity}
      tint={resolvedTint}
      {...rest}
      style={[
        {
          borderRadius: rounded,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)',
          backgroundColor: isDark ? 'rgba(16,22,46,0.42)' : 'rgba(255,255,255,0.45)',
        },
        style,
      ]}
    >
      <LinearGradient
        colors={
          isDark
            ? ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0)']
            : ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.9 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <View className={className}>{children}</View>
    </BlurView>
  );
}
