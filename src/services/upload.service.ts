import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from '@/utils/secureStore';
import { SECURE_KEYS } from '@/constants/storageKeys';
import type { ApiResponse } from '@/types/common';
import type { ProposalDocument } from '@/features/faculty/types/proposal-document.types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://furpms-be-1.onrender.com/api';

export interface PickedFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type UploadProgressCallback = (progress: UploadProgress) => void;

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',
];

export const uploadService = {
  async pickFile(types?: string[]): Promise<PickedFile | null> {
    const result = await DocumentPicker.getDocumentAsync({
      type: types ?? ALLOWED_MIME_TYPES,
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return null;

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.name,
      size: asset.size ?? 0,
      mimeType: asset.mimeType ?? 'application/octet-stream',
    };
  },

  async uploadFile<T = UploadedFile>(
    file: PickedFile,
    endpoint: string,
    fieldName: string = 'file',
    extraFields?: Record<string, string>,
    onProgress?: UploadProgressCallback,
  ): Promise<T> {
    const token = await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

    const formData = new FormData();
    formData.append(fieldName, {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    } as never);

    if (extraFields) {
      Object.entries(extraFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            // Every real endpoint wraps its payload in ApiResponse<T> — unwrap it here so
            // callers deal in plain domain types, matching web's service-layer convention.
            const parsed = JSON.parse(xhr.responseText) as ApiResponse<T>;
            resolve(parsed.data);
          } catch {
            reject(new Error('Invalid JSON response from upload endpoint'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
      xhr.addEventListener('abort', () => reject(new Error('Upload was aborted')));
      xhr.addEventListener('timeout', () => reject(new Error('Upload timed out')));

      xhr.open('POST', url);
      xhr.timeout = 120_000; // 2 minutes
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  },

  async uploadProposalDocument(
    proposalId: string,
    file: PickedFile,
    documentType?: string,
    onProgress?: UploadProgressCallback,
  ): Promise<UploadedFile> {
    // The FileUploader widget renders a generic {name,size,url,...} shape regardless of endpoint;
    // adapt the real ProposalDocument response (fileName/fileSizeBytes/downloadUrl) into it.
    const doc = await this.uploadFile<ProposalDocument>(
      file,
      `/proposals/${proposalId}/documents`,
      'file',
      documentType ? { documentType } : undefined,
      onProgress,
    );
    return {
      id: doc.id,
      name: doc.fileName,
      url: doc.downloadUrl ?? '',
      size: doc.fileSizeBytes,
      mimeType: file.mimeType,
      uploadedAt: doc.uploadedAt,
    };
  },

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },
};
