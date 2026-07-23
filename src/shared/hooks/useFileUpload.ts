import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  uploadService,
  type PickedFile,
  type UploadedFile,
  type UploadProgress,
} from '@/services/upload.service';

interface UseFileUploadOptions {
  endpoint: string;
  fieldName?: string;
  extraFields?: Record<string, string>;
  allowedTypes?: string[];
  maxSizeMB?: number;
  onSuccess?: (file: UploadedFile) => void;
}

interface UseFileUploadReturn {
  pickedFile: PickedFile | null;
  uploadedFile: UploadedFile | null;
  isPickingFile: boolean;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  pickFile: () => Promise<void>;
  upload: () => Promise<UploadedFile | null>;
  pickAndUpload: () => Promise<UploadedFile | null>;
  reset: () => void;
}

export function useFileUpload({
  endpoint,
  fieldName = 'file',
  extraFields,
  allowedTypes,
  maxSizeMB = 50,
  onSuccess,
}: UseFileUploadOptions): UseFileUploadReturn {
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isPickingFile, setIsPickingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPickedFile(null);
    setUploadedFile(null);
    setProgress(null);
    setError(null);
  }, []);

  const pickFile = useCallback(async (): Promise<void> => {
    setIsPickingFile(true);
    setError(null);
    try {
      const file = await uploadService.pickFile(allowedTypes);
      if (!file) return;

      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`File too large. Maximum size is ${maxSizeMB} MB.`);
        return;
      }

      setPickedFile(file);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to pick file';
      setError(message);
    } finally {
      setIsPickingFile(false);
    }
  }, [allowedTypes, maxSizeMB]);

  const upload = useCallback(async (): Promise<UploadedFile | null> => {
    if (!pickedFile) {
      setError('No file selected');
      return null;
    }

    setIsUploading(true);
    setProgress(null);
    setError(null);

    try {
      const result = await uploadService.uploadFile(
        pickedFile,
        endpoint,
        fieldName,
        extraFields,
        (p) => setProgress(p),
      );

      setUploadedFile(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      Alert.alert('Upload Failed', message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [pickedFile, endpoint, fieldName, extraFields, onSuccess]);

  const pickAndUpload = useCallback(async (): Promise<UploadedFile | null> => {
    setIsPickingFile(true);
    setError(null);

    let file: PickedFile | null = null;
    try {
      file = await uploadService.pickFile(allowedTypes);
      if (!file) return null;

      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`File too large. Maximum size is ${maxSizeMB} MB.`);
        return null;
      }

      setPickedFile(file);
    } finally {
      setIsPickingFile(false);
    }

    if (!file) return null;

    setIsUploading(true);
    setProgress(null);
    try {
      const result = await uploadService.uploadFile(
        file,
        endpoint,
        fieldName,
        extraFields,
        (p) => setProgress(p),
      );

      setUploadedFile(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      Alert.alert('Upload Failed', message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [allowedTypes, maxSizeMB, endpoint, fieldName, extraFields, onSuccess]);

  return {
    pickedFile,
    uploadedFile,
    isPickingFile,
    isUploading,
    progress,
    error,
    pickFile,
    upload,
    pickAndUpload,
    reset,
  };
}
