import { Modal, View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { formatDateTime } from '@/utils/date';
import type { AppNotification, NotificationType } from '../types/notification.types';

const typeConfig: Record<NotificationType, { icon: string; bg: string; color: string; label: string }> = {
  PROPOSAL: { icon: 'document-text', bg: 'bg-blue-100 dark:bg-blue-900/30', color: '#3B82F6', label: 'Đề cương' },
  REVIEW: { icon: 'clipboard', bg: 'bg-violet-100 dark:bg-violet-900/30', color: '#2358D6', label: 'Phản biện' },
  COUNCIL: { icon: 'people', bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: '#22C55E', label: 'Hội đồng' },
  MEETING: { icon: 'calendar', bg: 'bg-amber-100 dark:bg-amber-900/30', color: '#F59E0B', label: 'Cuộc họp' },
  CONTRACT: { icon: 'document-lock', bg: 'bg-orange-100 dark:bg-orange-900/30', color: '#F97316', label: 'Hợp đồng' },
  SYSTEM: { icon: 'information-circle', bg: 'bg-neutral-100 dark:bg-dark-200', color: '#6E6E80', label: 'Hệ thống' },
};

interface NotificationDetailModalProps {
  notification: AppNotification | null;
  onClose: () => void;
}

export function NotificationDetailModal({ notification, onClose }: NotificationDetailModalProps) {
  const { colors, isDark } = useTheme();

  if (!notification) return null;

  const config = typeConfig[notification.type] ?? typeConfig.SYSTEM;

  return (
    <Modal
      visible={!!notification}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: isDark ? '#111118' : '#FFFFFF',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingBottom: 40,
            maxHeight: '80%',
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: isDark ? '#3A3A4A' : '#E5E7EB' }} />
          </View>

          <ScrollView
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ padding: 24, gap: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Icon + Type badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: isDark ? config.color + '33' : config.color + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={config.icon as React.ComponentProps<typeof Ionicons>['name']}
                  size={26}
                  color={config.color}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: config.color + '22',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ color: config.color, fontSize: 11, fontWeight: '600' }}>{config.label}</Text>
                </View>
                <Text style={{ color: isDark ? '#9B9BB0' : '#6B7280', fontSize: 12 }}>
                  {formatDateTime(notification.createdAt)}
                </Text>
              </View>
              {/* Close button */}
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: isDark ? '#1E1E2E' : '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={18} color={isDark ? '#9B9BB0' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: isDark ? '#2A2A3A' : '#F3F4F6' }} />

            {/* Title */}
            <View style={{ gap: 8 }}>
              <Text style={{ color: isDark ? '#E8E8F0' : '#111827', fontSize: 18, fontWeight: '700', lineHeight: 26 }}>
                {notification.title}
              </Text>

              {/* Full message */}
              <Text style={{ color: isDark ? '#9B9BB0' : '#4B5563', fontSize: 15, lineHeight: 24 }}>
                {notification.message}
              </Text>
            </View>

            {/* Read status badge */}
            {notification.read && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                <Text style={{ color: '#22C55E', fontSize: 12, fontWeight: '500' }}>Đã đọc</Text>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
