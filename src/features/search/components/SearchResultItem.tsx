import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { SearchResult, SearchResultType } from '../types/search.types';

interface SearchResultItemProps {
  result: SearchResult;
  onPress: (result: SearchResult) => void;
  query?: string;
}

const TYPE_CONFIG: Record<
  SearchResultType,
  { icon: React.ComponentProps<typeof Ionicons>['name']; color: string; label: string }
> = {
  PROPOSAL: { icon: 'document-text-outline', color: '#7c3aed', label: 'Proposal' },
  PERSON: { icon: 'person-circle-outline', color: '#0891b2', label: 'Person' },
  MEETING: { icon: 'videocam-outline', color: '#059669', label: 'Meeting' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; bgDark: string; textDark: string }> = {
  APPROVED: { bg: '#d1fae5', text: '#065f46', bgDark: 'rgba(5,150,105,0.2)', textDark: '#6ee7b7' },
  UNDER_REVIEW: { bg: '#dbeafe', text: '#1e40af', bgDark: 'rgba(37,99,235,0.2)', textDark: '#93c5fd' },
  REVISION_REQUIRED: { bg: '#fef3c7', text: '#92400e', bgDark: 'rgba(245,158,11,0.2)', textDark: '#fcd34d' },
  REJECTED: { bg: '#fee2e2', text: '#991b1b', bgDark: 'rgba(239,68,68,0.2)', textDark: '#fca5a5' },
  UPCOMING: { bg: '#ede9fe', text: '#5b21b6', bgDark: 'rgba(124,58,237,0.2)', textDark: '#c4b5fd' },
};

function HighlightedText({ text, query, style }: { text: string; query?: string; style: object }) {
  const { isDark } = useTheme();
  if (!query?.trim()) return <Text style={style}>{text}</Text>;

  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Text key={i} style={{ backgroundColor: isDark ? '#3b1f6e' : '#ede9fe', color: isDark ? '#c4b5fd' : '#5b21b6', borderRadius: 3 }}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

export function SearchResultItem({ result, onPress, query }: SearchResultItemProps) {
  const { colors, isDark } = useTheme();
  const cfg = TYPE_CONFIG[result.type];
  const statusCfg = result.status ? STATUS_COLORS[result.status] : null;

  return (
    <TouchableOpacity
      onPress={() => onPress(result)}
      activeOpacity={0.7}
      style={[
        styles.container,
        { backgroundColor: isDark ? '#1c1c1e' : '#ffffff', borderColor: isDark ? '#2a2a2a' : '#f3f4f6' },
      ]}
    >
      {/* Icon */}
      <View style={[styles.iconWrapper, { backgroundColor: isDark ? `${cfg.color}20` : `${cfg.color}15` }]}>
        <Ionicons name={cfg.icon} size={20} color={cfg.color} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <HighlightedText
            text={result.title}
            query={query}
            style={[styles.title, { color: colors.text.primary }]}
          />
          {result.status && statusCfg && (
            <View style={[styles.badge, { backgroundColor: isDark ? statusCfg.bgDark : statusCfg.bg }]}>
              <Text style={[styles.badgeText, { color: isDark ? statusCfg.textDark : statusCfg.text }]}>
                {result.status.replace(/_/g, ' ')}
              </Text>
            </View>
          )}
        </View>

        {result.subtitle && (
          <Text style={[styles.subtitle, { color: colors.text.secondary }]} numberOfLines={1}>
            {result.subtitle}
          </Text>
        )}

        <View style={styles.metaRow}>
          <Text style={[styles.typeTag, { color: cfg.color }]}>{cfg.label}</Text>
          {result.metadata && (
            <>
              <Text style={[styles.dot, { color: colors.text.tertiary }]}>·</Text>
              <Text style={[styles.meta, { color: colors.text.tertiary }]} numberOfLines={1}>
                {result.metadata}
              </Text>
            </>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.icon.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 8,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: 3 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  badgeText: { fontSize: 10, fontWeight: '600' },
  subtitle: { fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  typeTag: { fontSize: 11, fontWeight: '600' },
  dot: { fontSize: 11 },
  meta: { fontSize: 11, flex: 1 },
});
