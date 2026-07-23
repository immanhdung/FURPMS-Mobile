import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SecureStore from '@/utils/secureStore';
import { SECURE_KEYS } from '@/constants/storageKeys';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api';

export interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface DownloadResult {
  uri: string;
  filename: string;
  mimeType: string;
  size: number;
}

export type DownloadProgressCallback = (progress: DownloadProgress) => void;

export const downloadService = {
  async downloadFile(
    pathOrUrl: string,
    filename: string,
    onProgress?: DownloadProgressCallback,
  ): Promise<DownloadResult> {
    const token = await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
    const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${BASE_URL}${pathOrUrl}`;
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Signal start (indeterminate)
    onProgress?.({ loaded: 0, total: 0, percentage: 0 });

    const destination = new File(Paths.document, sanitizedFilename);

    // Overwrite any stale file
    if (destination.exists) {
      destination.delete();
    }

    // expo-file-system v19: downloadFileAsync on the File class
    await File.downloadFileAsync(url, destination, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      idempotent: true,
    });

    // Signal complete
    const size = destination.size ?? 0;
    onProgress?.({ loaded: size, total: size, percentage: 100 });

    const mimeType = inferMimeType(sanitizedFilename);
    return { uri: destination.uri, filename: sanitizedFilename, mimeType, size };
  },

  async openFile(uri: string, mimeType?: string): Promise<void> {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) throw new Error('Sharing not available on this device');
    await Sharing.shareAsync(uri, {
      UTI: mimeType === 'application/pdf' ? 'com.adobe.pdf' : undefined,
      mimeType,
    });
  },

  async deleteFile(uri: string): Promise<void> {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  },

  async getCachedFile(filename: string): Promise<string | null> {
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const file = new File(Paths.document, sanitized);
    return file.exists ? file.uri : null;
  },

  async getCacheSize(): Promise<number> {
    try {
      return Paths.document.size ?? 0;
    } catch {
      return 0;
    }
  },

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },
};

function inferMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    zip: 'application/zip',
  };
  return map[ext ?? ''] ?? 'application/octet-stream';
}
