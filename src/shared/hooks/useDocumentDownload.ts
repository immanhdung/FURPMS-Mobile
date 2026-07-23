import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { downloadService, type DownloadProgress, type DownloadResult } from '@/services/download.service';

interface UseDocumentDownloadReturn {
  download: (pathOrUrl: string, filename: string) => Promise<DownloadResult | null>;
  open: (uri: string, mimeType?: string) => Promise<void>;
  isDownloading: boolean;
  progress: DownloadProgress | null;
  error: string | null;
  reset: () => void;
}

export function useDocumentDownload(): UseDocumentDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setProgress(null);
    setError(null);
  }, []);

  const download = useCallback(
    async (pathOrUrl: string, filename: string): Promise<DownloadResult | null> => {
      setIsDownloading(true);
      setProgress(null);
      setError(null);

      try {
        // Check for cached version first
        const cached = await downloadService.getCachedFile(filename);
        if (cached) {
          return { uri: cached, filename, mimeType: 'application/octet-stream', size: 0 };
        }

        const result = await downloadService.downloadFile(pathOrUrl, filename, (p) => {
          setProgress(p);
        });

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Download failed';
        setError(message);
        Alert.alert('Download Failed', message);
        return null;
      } finally {
        setIsDownloading(false);
      }
    },
    [],
  );

  const open = useCallback(async (uri: string, mimeType?: string): Promise<void> => {
    try {
      await downloadService.openFile(uri, mimeType);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not open file';
      Alert.alert('Cannot Open File', message);
    }
  }, []);

  return { download, open, isDownloading, progress, error, reset };
}
