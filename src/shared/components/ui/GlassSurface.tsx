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
  /** Applied to both the shadow-casting wrapper and the BlurView (radius/size overrides, maxHeight...). */
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Frosted "liquid glass" container: blurred backdrop + translucent tint + hairline border + a soft
 * diagonal highlight + drop shadow, mimicking iOS's Liquid Glass material. Use in place of a flat
 * `bg-white dark:bg-dark-50` card. The drop shadow lives on an outer wrapper (not the clipped
 * BlurView) because `overflow: hidden` — required to clip the blur to rounded corners — would
 * otherwise clip the shadow too, and without it the card is nearly invisible over a plain flat
 * screen background (no shadow, near-transparent border/tint = no visible edge at all).
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
    <View
      style={[
        {
          borderRadius: rounded,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0 : 0.08,
          shadowRadius: 12,
          elevation: isDark ? 0 : 3,
        },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={resolvedTint}
        {...rest}
        style={[
          {
            borderRadius: rounded,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.08)',
            backgroundColor: isDark ? 'rgba(16,22,46,0.5)' : 'rgba(255,255,255,0.72)',
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
    </View>
  );
}
