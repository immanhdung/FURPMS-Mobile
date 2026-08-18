import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { useProposalDocuments, useDeleteProposalDocument } from '@/features/faculty/hooks/useProposalDocuments';
import { proposalDocumentService } from '@/features/faculty/services/proposal-document.service';
import { uploadService, type PickedFile } from '@/services/upload.service';
import { useDocumentDownload } from '@/shared/hooks/useDocumentDownload';
import { FileUploader } from '@/shared/components/upload/FileUploader';
import { downloadService } from '@/services/download.service';
import { formatDate } from '@/utils/date';

interface ProposalDocumentsCardProps {
  proposalId: string;
  editable: boolean;
}

export function ProposalDocumentsCard({ proposalId, editable }: ProposalDocumentsCardProps) {
  const { t } = useTranslation(['faculty', 'common']);
  const { colors } = useTheme();
  const { data: documents, isLoading, refetch } = useProposalDocuments(proposalId);
  const { mutate: deleteDocument, variables: deletingId, isPending: isDeleting } = useDeleteProposalDocument(proposalId);
  const { download, open, isDownloading } = useDocumentDownload();

  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<{ percentage: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handlePick() {
    setIsPicking(true);
    setUploadError(null);
    try {
      const file = await uploadService.pickFile();
      if (file) setPickedFile(file);
    } finally {
      setIsPicking(false);
    }
  }

  async function handleUpload() {
    if (!pickedFile) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      await uploadService.uploadProposalDocument(proposalId, pickedFile, undefined, (p) => setProgress(p));
      setPickedFile(null);
      setProgress(null);
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('proposalDocumentsCard.uploadFailedGeneric');
      setUploadError(message);
      Alert.alert(t('proposalDocumentsCard.uploadFailedTitle'), message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleOpen(documentId: string, fileName: string) {
    const result = await download(proposalDocumentService.downloadPath(proposalId, documentId), fileName);
    if (result) await open(result.uri, result.mimeType);
  }

  function handleDelete(documentId: string, fileName: string) {
    Alert.alert(t('proposalDocumentsCard.deleteTitle'), t('proposalDocumentsCard.deleteMessage', { fileName }), [
      { text: t('common:buttons.cancel'), style: 'cancel' },
      { text: t('proposalDocumentsCard.delete'), style: 'destructive', onPress: () => deleteDocument(documentId) },
    ]);
  }

  return (
    <GlassSurface rounded={24} className="p-4 gap-3">
      {isLoading ? (
        <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans">{t('proposalDocumentsCard.loading')}</Text>
      ) : documents && documents.length > 0 ? (
        documents.map((doc, i) => {
          const decodedName = decodeURIComponent(doc.fileName);
          return (
            <View key={doc.id}>
              {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 my-1" />}
              <View className="flex-row items-center gap-3">
                <View className="bg-violet-100 dark:bg-violet-900/30 w-9 h-9 rounded-xl items-center justify-center">
                  <Ionicons name="document-text-outline" size={18} color={colors.accent.primary} />
                </View>
                <TouchableOpacity className="flex-1" activeOpacity={0.7} onPress={() => handleOpen(doc.id, doc.fileName)} disabled={isDownloading}>
                  <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium" numberOfLines={1}>
                    {decodedName}
                  </Text>
                  <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                    {downloadService.formatFileSize(doc.fileSizeBytes)} · {formatDate(doc.uploadedAt)}
                  </Text>
                </TouchableOpacity>
                {editable && (
                  <TouchableOpacity
                    onPress={() => handleDelete(doc.id, decodedName)}
                    disabled={isDeleting && deletingId === doc.id}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.accent.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      ) : (
        <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans">{t('proposalDocumentsCard.empty')}</Text>
      )}

      {editable && (
        <>
          {documents && documents.length > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200" />}
          <FileUploader
            pickedFile={pickedFile}
            uploadedFile={null}
            isPickingFile={isPicking}
            isUploading={isUploading}
            progress={progress}
            error={uploadError}
            onPick={handlePick}
            onUpload={handleUpload}
            onRemove={() => setPickedFile(null)}
            label={t('common:fileUploader.attachDocument')}
            hint={t('proposalDocumentsCard.hint')}
          />
        </>
      )}
    </GlassSurface>
  );
}
