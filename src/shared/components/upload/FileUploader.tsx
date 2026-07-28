import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { type PickedFile, type UploadedFile, uploadService } from '@/services/upload.service';

interface FileUploaderProps {
  pickedFile: PickedFile | null;
  uploadedFile: UploadedFile | null;
  isPickingFile: boolean;
  isUploading: boolean;
  progress: { percentage: number } | null;
  error: string | null;
  onPick: () => void;
  onUpload?: () => void;
  onRemove?: () => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

export function FileUploader({
  pickedFile,
  uploadedFile,
  isPickingFile,
  isUploading,
  progress,
  error,
  onPick,
  onUpload,
  onRemove,
  label,
  hint,
  disabled = false,
}: FileUploaderProps) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation('common');
  const resolvedLabel = label ?? t('fileUploader.attachDocument');
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(progress?.percentage ?? 0, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  }, [progress?.percentage, progressWidth]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  if (uploadedFile) {
    return (
      <View
        style={[
          styles.uploadedContainer,
          { backgroundColor: isDark ? '#0d1a12' : '#f0fdf4', borderColor: isDark ? '#14532d' : '#86efac' },
        ]}
      >
        <View style={styles.uploadedIcon}>
          <Ionicons name="checkmark-circle" size={20} color={colors.accent.success} />
        </View>
        <View style={styles.fileInfo}>
          <Text style={[styles.fileName, { color: colors.text.primary }]} numberOfLines={1}>
            {uploadedFile.name}
          </Text>
          <Text style={[styles.fileSize, { color: colors.text.secondary }]}>
            {uploadService.formatFileSize(uploadedFile.size)} · {t('fileUploader.uploaded')}
          </Text>
        </View>
        {onRemove && (
          <TouchableOpacity onPress={onRemove} activeOpacity={0.7} style={styles.removeButton}>
            <Ionicons name="close-circle" size={18} color={colors.icon.muted} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (pickedFile && !isUploading) {
    return (
      <View>
        <View
          style={[
            styles.pickedContainer,
            { backgroundColor: isDark ? '#1c1c1e' : '#f8fafc', borderColor: isDark ? '#2a2a2a' : '#e2e8f0' },
          ]}
        >
          <View
            style={[
              styles.fileIconContainer,
              { backgroundColor: isDark ? '#27272a' : '#dce6fc' },
            ]}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.accent.primary} />
          </View>
          <View style={styles.fileInfo}>
            <Text style={[styles.fileName, { color: colors.text.primary }]} numberOfLines={1}>
              {pickedFile.name}
            </Text>
            <Text style={[styles.fileSize, { color: colors.text.secondary }]}>
              {uploadService.formatFileSize(pickedFile.size)}
            </Text>
          </View>
          <View style={styles.rowActions}>
            {onUpload && (
              <TouchableOpacity
                onPress={onUpload}
                activeOpacity={0.7}
                style={[styles.uploadButton, { backgroundColor: colors.accent.primary }]}
              >
                <Text style={styles.uploadButtonText}>{t('fileUploader.upload')}</Text>
              </TouchableOpacity>
            )}
            {onRemove && (
              <TouchableOpacity onPress={onRemove} activeOpacity={0.7}>
                <Ionicons name="close" size={18} color={colors.icon.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {error && (
          <Text style={[styles.errorText, { color: colors.accent.danger }]}>{error}</Text>
        )}
      </View>
    );
  }

  if (isUploading || isPickingFile) {
    return (
      <View
        style={[
          styles.uploadingContainer,
          { backgroundColor: isDark ? '#1c1c1e' : '#f8fafc', borderColor: isDark ? '#2a2a2a' : '#e2e8f0' },
        ]}
      >
        {pickedFile && (
          <View style={styles.uploadingRow}>
            <Ionicons name="document-text-outline" size={18} color={colors.icon.muted} />
            <Text style={[styles.fileName, { color: colors.text.secondary, flex: 1 }]} numberOfLines={1}>
              {pickedFile.name}
            </Text>
          </View>
        )}
        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarFill,
              progressStyle,
              { backgroundColor: colors.accent.primary },
            ]}
          />
        </View>
        <View style={styles.uploadingStatus}>
          <ActivityIndicator size="small" color={colors.accent.primary} />
          <Text style={[styles.uploadingText, { color: colors.text.secondary }]}>
            {isPickingFile
              ? t('fileUploader.selectingFile')
              : progress
              ? t('fileUploader.uploading', { percent: progress.percentage })
              : t('fileUploader.preparingUpload')}
          </Text>
        </View>
      </View>
    );
  }

  // Default — empty picker
  return (
    <View>
      <TouchableOpacity
        onPress={onPick}
        activeOpacity={0.7}
        disabled={disabled}
        style={[
          styles.pickerButton,
          {
            borderColor: error
              ? colors.accent.danger
              : isDark
              ? '#2a2a2a'
              : '#d1d5db',
            backgroundColor: isDark ? '#1c1c1e' : '#fafafa',
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Ionicons
          name="cloud-upload-outline"
          size={28}
          color={error ? colors.accent.danger : colors.accent.primary}
        />
        <Text style={[styles.pickerLabel, { color: colors.text.primary }]}>{resolvedLabel}</Text>
        {hint && (
          <Text style={[styles.pickerHint, { color: colors.text.tertiary }]}>{hint}</Text>
        )}
      </TouchableOpacity>
      {error && (
        <Text style={[styles.errorText, { color: colors.accent.danger }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pickerButton: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  pickerLabel: { fontSize: 15, fontWeight: '600' },
  pickerHint: { fontSize: 12, textAlign: 'center' },
  uploadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  uploadedIcon: {},
  pickedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: { flex: 1, gap: 2 },
  fileName: { fontSize: 14, fontWeight: '500' },
  fileSize: { fontSize: 12 },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  uploadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  uploadButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  removeButton: {},
  uploadingContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  uploadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 2 },
  uploadingStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  uploadingText: { fontSize: 13 },
  errorText: { fontSize: 12, marginTop: 4 },
});
