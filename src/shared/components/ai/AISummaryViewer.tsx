import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { AISummary } from '@/features/reviewCommittee/types/review.types';

interface AISummaryViewerProps {
  summary: AISummary;
  proposalTitle?: string;
}

type SectionKey = 'strengths' | 'weaknesses' | 'concerns';

const CONFIDENCE_CONFIG = {
  HIGH: { color: '#10b981', bg: '#ecfdf5', bgDark: 'rgba(16,185,129,0.15)', label: 'High Confidence', icon: 'shield-checkmark' as const },
  MEDIUM: { color: '#f59e0b', bg: '#fffbeb', bgDark: 'rgba(245,158,11,0.15)', label: 'Medium Confidence', icon: 'shield-outline' as const },
  LOW: { color: '#ef4444', bg: '#fef2f2', bgDark: 'rgba(239,68,68,0.15)', label: 'Low Confidence', icon: 'shield-outline' as const },
};

function ConfidenceMeter({ confidence, score }: { confidence: AISummary['confidence']; score: number }) {
  const { isDark } = useTheme();
  const cfg = CONFIDENCE_CONFIG[confidence];
  const scoreProgress = useSharedValue(0);
  const confidenceProgress = useSharedValue(0);

  const normalizedScore = Math.min(Math.max(score / 10, 0), 1);
  const confidenceValue = confidence === 'HIGH' ? 1 : confidence === 'MEDIUM' ? 0.6 : 0.3;

  useEffect(() => {
    scoreProgress.value = withDelay(300, withTiming(normalizedScore, { duration: 1000, easing: Easing.out(Easing.cubic) }));
    confidenceProgress.value = withDelay(400, withTiming(confidenceValue, { duration: 800, easing: Easing.out(Easing.quad) }));
  }, [score, confidence, scoreProgress, confidenceProgress, normalizedScore, confidenceValue]);

  const scoreBarStyle = useAnimatedStyle(() => ({
    width: `${scoreProgress.value * 100}%`,
  }));

  const confBarStyle = useAnimatedStyle(() => ({
    width: `${confidenceProgress.value * 100}%`,
  }));

  return (
    <View
      style={[
        styles.meterContainer,
        { backgroundColor: isDark ? cfg.bgDark : cfg.bg, borderColor: isDark ? `${cfg.color}30` : `${cfg.color}40` },
      ]}
    >
      <View style={styles.meterRow}>
        <View style={styles.meterLeft}>
          <Ionicons name={cfg.icon} size={16} color={cfg.color} />
          <Text style={[styles.meterLabel, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Text style={[styles.scoreValue, { color: cfg.color }]}>{score.toFixed(1)}/10</Text>
      </View>

      <View style={styles.barSection}>
        <Text style={[styles.barLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Suggested Score</Text>
        <View style={[styles.barTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
          <Animated.View style={[styles.barFill, scoreBarStyle, { backgroundColor: cfg.color }]} />
        </View>
      </View>

      <View style={styles.barSection}>
        <Text style={[styles.barLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>Model Confidence</Text>
        <View style={[styles.barTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
          <Animated.View style={[styles.barFill, confBarStyle, { backgroundColor: cfg.color, opacity: 0.7 }]} />
        </View>
      </View>
    </View>
  );
}

function CollapsibleSection({
  title,
  items,
  iconName,
  itemBgClass,
  textColor,
  iconColor,
  delay = 0,
}: {
  title: string;
  items: string[];
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  itemBgClass: string;
  textColor: string;
  iconColor: string;
  delay?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const scaleY = useSharedValue(1);
  const opacity = useSharedValue(1);
  const { isDark } = useTheme();

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scaleY: scaleY.value }],
    transformOrigin: 'top',
    overflow: 'hidden' as const,
  }));

  function toggle() {
    const toValue = expanded ? 0 : 1;
    scaleY.value = withSpring(toValue, { damping: 16, stiffness: 200 });
    opacity.value = withTiming(toValue, { duration: 200 });
    setExpanded(!expanded);
  }

  if (items.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.7}
        style={styles.sectionHeader}
      >
        <Text style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
          {title}
        </Text>
        <View style={styles.sectionHeaderRight}>
          <Text style={[styles.itemCount, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            {items.length}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={isDark ? '#9ca3af' : '#6b7280'}
          />
        </View>
      </TouchableOpacity>

      <Animated.View style={contentStyle}>
        <View style={styles.itemsList}>
          {items.map((item, i) => (
            <Animated.View
              key={i}
              entering={FadeInDown.delay(delay + i * 60).duration(300)}
              style={[
                styles.itemRow,
                { backgroundColor: isDark ? `${iconColor}15` : itemBgClass },
              ]}
            >
              <Ionicons name={iconName} size={14} color={iconColor} style={styles.itemIcon} />
              <Text style={[styles.itemText, { color: textColor }]}>{item}</Text>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export function AISummaryViewer({ summary, proposalTitle }: AISummaryViewerProps) {
  const { colors, isDark } = useTheme();

  async function handleShare() {
    const text = [
      proposalTitle ? `AI Review Summary: ${proposalTitle}` : 'AI Review Summary',
      '',
      `Overall Score: ${summary.suggestedScore}/10`,
      `Confidence: ${summary.confidence}`,
      '',
      '📄 Summary',
      summary.summary,
      '',
      summary.keyStrengths.length > 0 ? ['✅ Key Strengths', ...summary.keyStrengths.map(s => `• ${s}`)].join('\n') : '',
      summary.keyWeaknesses.length > 0 ? ['❌ Key Weaknesses', ...summary.keyWeaknesses.map(w => `• ${w}`)].join('\n') : '',
      summary.concernAreas.length > 0 ? ['⚠️ Concerns', ...summary.concernAreas.map(c => `• ${c}`)].join('\n') : '',
    ].filter(Boolean).join('\n');

    await Share.share({ message: text, title: 'AI Review Summary' });
  }

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.aiChip, { backgroundColor: isDark ? '#2d1b69' : '#ede9fe' }]}>
            <Ionicons name="sparkles" size={14} color={colors.accent.primary} />
            <Text style={[styles.aiChipText, { color: colors.accent.primary }]}>AI Analysis</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleShare} activeOpacity={0.7} style={styles.shareButton}>
          <Ionicons name="share-outline" size={20} color={colors.icon.default} />
        </TouchableOpacity>
      </View>

      {/* Confidence meter + score */}
      <ConfidenceMeter confidence={summary.confidence} score={summary.suggestedScore} />

      {/* Summary text */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={[
          styles.summaryCard,
          { backgroundColor: isDark ? '#1c1c1e' : '#ffffff', borderColor: isDark ? '#2a2a2a' : '#e5e7eb' },
        ]}
      >
        <Text style={[styles.summaryTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
          Summary
        </Text>
        <Text style={[styles.summaryText, { color: isDark ? '#d1d5db' : '#374151' }]}>
          {summary.summary}
        </Text>
      </Animated.View>

      {/* Strengths */}
      <CollapsibleSection
        title="Key Strengths"
        items={summary.keyStrengths}
        iconName="checkmark-circle"
        itemBgClass="#ecfdf5"
        textColor={isDark ? '#6ee7b7' : '#065f46'}
        iconColor="#10b981"
        delay={300}
      />

      {/* Weaknesses */}
      <CollapsibleSection
        title="Key Weaknesses"
        items={summary.keyWeaknesses}
        iconName="close-circle"
        itemBgClass="#fef2f2"
        textColor={isDark ? '#fca5a5' : '#991b1b'}
        iconColor="#ef4444"
        delay={400}
      />

      {/* Concerns */}
      <CollapsibleSection
        title="Areas of Concern"
        items={summary.concernAreas}
        iconName="warning"
        itemBgClass="#fffbeb"
        textColor={isDark ? '#fcd34d' : '#92400e'}
        iconColor="#f59e0b"
        delay={500}
      />

      <Animated.Text
        entering={FadeIn.delay(600).duration(300)}
        style={[styles.generatedAt, { color: isDark ? '#4b5563' : '#9ca3af' }]}
      >
        Generated {new Date(summary.generatedAt).toLocaleString()}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  aiChipText: { fontSize: 12, fontWeight: '600' },
  shareButton: { padding: 6 },
  meterContainer: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12, marginBottom: 16 },
  meterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meterLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meterLabel: { fontSize: 13, fontWeight: '600' },
  scoreValue: { fontSize: 22, fontWeight: '700' },
  barSection: { gap: 6 },
  barLabel: { fontSize: 11, fontWeight: '500' },
  barTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  summaryCard: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 8, marginBottom: 16 },
  summaryTitle: { fontSize: 14, fontWeight: '600' },
  summaryText: { fontSize: 14, lineHeight: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, marginBottom: 8 },
  sectionHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '600' },
  itemCount: { fontSize: 12 },
  itemsList: { gap: 6, marginBottom: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  itemIcon: { marginTop: 2 },
  itemText: { flex: 1, fontSize: 13, lineHeight: 19 },
  generatedAt: { fontSize: 11, textAlign: 'center', marginTop: 4 },
});
