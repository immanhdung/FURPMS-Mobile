import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('common');
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [webViewError, setWebViewError] = useState(false);
  const { download, open, isDownloading, progress } = useDocumentDownload();
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [loadingBase64, setLoadingBase64] = useState(false);

  const viewerUrl = buildViewerUrl(uri);
  const displayTitle = title ?? filename ?? t('pdfViewer.document');

  useEffect(() => {
    if (Platform.OS === 'android' && (uri.startsWith('file://') || uri.startsWith('/'))) {
      setLoadingBase64(true);
      FileSystem.readAsStringAsync(uri, { encoding: 'base64' })
        .then((data) => {
          setBase64Data(data);
          setLoadingBase64(false);
        })
        .catch((err) => {
          console.error('Failed to read PDF as base64', err);
          setWebViewError(true);
          setLoadingBase64(false);
        });
    } else {
      setBase64Data(null);
    }
  }, [uri]);

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
        {(webViewLoading || loadingBase64) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.accent.primary} />
            <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
              {t('pdfViewer.loadingDocument')}
            </Text>
          </View>
        )}

        {webViewError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="document-outline" size={48} color={colors.icon.muted} />
            <Text style={[styles.errorTitle, { color: colors.text.primary }]}>
              {t('pdfViewer.cannotDisplayTitle')}
            </Text>
            <Text style={[styles.errorBody, { color: colors.text.secondary }]}>
              {t('pdfViewer.cannotDisplayBody')}
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
                    ? t('pdfViewer.downloading', { percent: progress?.percentage ?? 0 })
                    : t('pdfViewer.downloadAndOpen')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <WebView
            source={base64Data ? { html: getPdfJsHtml(base64Data) } : { uri: viewerUrl }}
            style={[styles.webview, { opacity: (webViewLoading || loadingBase64) ? 0 : 1 }]}
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

function getPdfJsHtml(base64String: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
  <style>
    body { margin: 0; padding: 0; background-color: #525659; }
    #viewer { display: flex; flex-direction: column; align-items: center; padding: 10px 0; }
    .page-container { margin-bottom: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); background-color: white; width: 95%; max-width: 800px; }
    canvas { display: block; width: 100%; height: auto; }
  </style>
</head>
<body>
  <div id="viewer"></div>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    
    try {
      const base64Data = "${base64String}";
      const binStr = atob(base64Data);
      const len = binStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binStr.charCodeAt(i);
      }
      
      pdfjsLib.getDocument({ data: bytes }).promise.then(function(pdf) {
        const viewer = document.getElementById('viewer');
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          pdf.getPage(pageNum).then(function(page) {
            const viewport = page.getViewport({ scale: 1.5 });
            const container = document.createElement('div');
            container.className = 'page-container';
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            container.appendChild(canvas);
            viewer.appendChild(container);
            
            const renderContext = {
              canvasContext: context,
              viewport: viewport
            };
            page.render(renderContext);
          });
        }
      }).catch(function(error) {
        document.body.innerHTML = '<div style="padding:20px;color:red;background:white;font-family:sans-serif;">Error loading PDF: ' + error.message + '</div>';
      });
    } catch(err) {
      document.body.innerHTML = '<div style="padding:20px;color:red;background:white;font-family:sans-serif;">Error rendering PDF: ' + err.message + '</div>';
    }
  </script>
</body>
</html>
  `;
}
