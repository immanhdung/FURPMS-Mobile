import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { GlassSurface } from './GlassSurface';

interface ListRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  dangerous?: boolean;
  loading?: boolean;
  showChevron?: boolean;
  value?: string;
}

/** Bold pill-shaped tappable row: icon in a tinted circle, optional value/chevron circle on the right. */
export function ListRow({ icon, label, onPress, dangerous, loading, showChevron = true, value }: ListRowProps) {
  const { colors, isDark } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} disabled={loading} style={{ opacity: loading ? 0.5 : 1 }}>
      <GlassSurface rounded={20} className="flex-row items-center px-4 py-3.5 gap-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: dangerous
              ? isDark
                ? 'rgba(239,68,68,0.18)'
                : '#FEE2E2'
              : isDark
              ? 'rgba(76,126,232,0.2)'
              : '#DCE6FC',
          }}
        >
          <Ionicons name={icon} size={18} color={dangerous ? colors.accent.danger : colors.accent.primary} />
        </View>
        <Text
          className={`flex-1 text-base font-semibold ${
            dangerous ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-50'
          }`}
        >
          {label}
        </Text>
        {value && <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans">{value}</Text>}
        {showChevron && (
          <View className="w-7 h-7 rounded-full items-center justify-center bg-neutral-100 dark:bg-dark-200">
            <Ionicons name="chevron-forward" size={14} color={colors.icon.muted} />
          </View>
        )}
      </GlassSurface>
    </TouchableOpacity>
  );
}
