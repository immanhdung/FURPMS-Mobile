import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useDocumentDownload } from '@/shared/hooks/useDocumentDownload';

interface PDFViewerProps {
  uri: string;           // remote URL or local file:// URI
  filename?: string;
  title?: string;
  showDownloadButton?: boolean;
  onClose?: () => void;
}

function buildViewerUrl(uri: string): string {
  // Local file — use directly in WebView via base64 or data URI is impractical.
  // For remote URLs we use Google Docs viewer embed which handles auth-free PDFs.
  // For auth-protected PDFs, the caller should download first and pass local URI.
  if (uri.startsWith('file://') || uri.startsWith('/')) {
    // Already local — WebView can render with file:// protocol on some platforms.
    // Wrap in minimal HTML for consistent rendering.
    return uri;
  }
  // Remote URL → Google Docs embedded viewer (no auth required, public PDFs only)
  return `https://docs.google.com/gviewer?embedded=true&url=${encodeURIComponent(uri)}`;
}

export function PDFViewer({ uri, filename, title, showDownloadButton = true, onClose }: PDFViewerProps) {
  const { colors, isDark } = useTheme();
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [webViewError, setWebViewError] = useState(false);
  const { download, open, isDownloading, progress } = useDocumentDownload();

  const viewerUrl = buildViewerUrl(uri);
  const displayTitle = title ?? filename ?? 'Document';

  const handleDownloadAndOpen = useCallback(async () => {
    if (!filename) return;
    const result = await download(uri, filename);
    if (result) await open(result.uri, result.mimeType);
  }, [uri, filename, download, open]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? '#111111' : '#ffffff',
            borderBottomColor: isDark ? '#2a2a2a' : '#e5e7eb',
          },
        ]}
      >
        {onClose && (
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={colors.icon.default} />
          </TouchableOpacity>
        )}

        <Text
          style={[styles.title, { color: colors.text.primary }]}
          numberOfLines={1}
        >
          {displayTitle}
        </Text>

        {showDownloadButton && filename && (
          <TouchableOpacity
            onPress={handleDownloadAndOpen}
            activeOpacity={0.7}
            disabled={isDownloading}
            style={styles.downloadButton}
          >
            {isDownloading ? (
              <View style={styles.progressRow}>
                <ActivityIndicator size="small" color={colors.accent.primary} />
                {progress && (
                  <Text style={[styles.progressText, { color: colors.accent.primary }]}>
                    {progress.percentage}%
                  </Text>
                )}
              </View>
            ) : (
              <Ionicons name="download-outline" size={22} color={colors.accent.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* WebView PDF renderer */}
      <View style={styles.webviewContainer}>
        {webViewLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.accent.primary} />
            <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
              Loading document…
            </Text>
          </View>
        )}

        {webViewError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="document-outline" size={48} color={colors.icon.muted} />
            <Text style={[styles.errorTitle, { color: colors.text.primary }]}>
              Cannot display document
            </Text>
            <Text style={[styles.errorBody, { color: colors.text.secondary }]}>
              The document could not be rendered in-app.
            </Text>
            {filename && (
              <TouchableOpacity
                onPress={handleDownloadAndOpen}
                activeOpacity={0.7}
                style={[styles.openExternalButton, { backgroundColor: colors.accent.primary }]}
                disabled={isDownloading}
              >
                <Text style={styles.openExternalText}>
                  {isDownloading
                    ? `Downloading… ${progress?.percentage ?? 0}%`
                    : 'Download & Open'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <WebView
            source={{ uri: viewerUrl }}
            style={[styles.webview, { opacity: webViewLoading ? 0 : 1 }]}
            onLoadStart={() => {
              setWebViewLoading(true);
              setWebViewError(false);
            }}
            onLoadEnd={() => setWebViewLoading(false)}
            onError={() => {
              setWebViewLoading(false);
              setWebViewError(true);
            }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState={false}
            allowFileAccess
            allowUniversalAccessFromFileURLs
            originWhitelist={['*']}
            mixedContentMode="compatibility"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  closeButton: { padding: 4 },
  title: { flex: 1, fontSize: 15, fontWeight: '600' },
  downloadButton: { padding: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  progressText: { fontSize: 12, fontWeight: '600' },
  webviewContainer: { flex: 1 },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  errorTitle: { fontSize: 17, fontWeight: '600' },
  errorBody: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  openExternalButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  openExternalText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
