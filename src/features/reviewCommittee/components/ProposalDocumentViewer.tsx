import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useProposalDocuments } from '@/features/faculty/hooks/useProposalDocuments';
import { proposalDocumentService } from '@/features/faculty/services/proposal-document.service';
import { useDocumentDownload } from '@/shared/hooks/useDocumentDownload';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { PDFViewer } from '@/shared/components/pdf/PDFViewer';
import { downloadService } from '@/services/download.service';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';

interface ProposalDocumentViewerProps {
  proposalId: string;
}

export function ProposalDocumentViewer({ proposalId }: ProposalDocumentViewerProps) {
  const { t } = useTranslation('reviewer');
  const { colors } = useTheme();
  const { data: documents, isLoading } = useProposalDocuments(proposalId);
  const { download, open, isDownloading, progress } = useDocumentDownload();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  async function handleView(documentId: string, fileName: string) {
    setOpeningId(documentId);
    try {
      const result = await download(proposalDocumentService.downloadPath(proposalId, documentId), fileName);
      if (!result) return;
      if (result.mimeType === 'application/pdf') {
        setPreviewUri(result.uri);
        setPreviewName(fileName);
      } else {
        await open(result.uri, result.mimeType);
      }
    } finally {
      setOpeningId(null);
    }
  }

  if (isLoading) return <LoadingState message={t('documentViewer.loading')} />;
  if (!documents || documents.length === 0) {
    return <EmptyState fullScreen={false} icon="📄" title={t('documentViewer.emptyTitle')} description={t('documentViewer.emptyDescription')} />;
  }

  return (
    <View className="gap-3">
      {documents.map((doc) => (
        <TouchableOpacity
          key={doc.id}
          onPress={() => handleView(doc.id, doc.fileName)}
          activeOpacity={0.7}
          disabled={isDownloading}
        >
          <GlassSurface rounded={24} className="flex-row items-center gap-3 p-4">
            <View className="bg-violet-100 dark:bg-violet-900/30 w-9 h-9 rounded-xl items-center justify-center">
              <Ionicons name="document-text-outline" size={18} color={colors.accent.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium" numberOfLines={1}>
                {doc.fileName}
              </Text>
              <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                {downloadService.formatFileSize(doc.fileSizeBytes)}
                {doc.documentType ? ` · ${doc.documentType}` : ''}
              </Text>
            </View>
            {openingId === doc.id && isDownloading ? (
              <Text className="text-neutral-400 dark:text-dark-500 text-xs font-sans">{progress?.percentage ?? 0}%</Text>
            ) : (
              <Ionicons name="eye-outline" size={18} color={colors.icon.muted} />
            )}
          </GlassSurface>
        </TouchableOpacity>
      ))}

      <Modal visible={!!previewUri} animationType="slide" onRequestClose={() => setPreviewUri(null)}>
        {previewUri && (
          <PDFViewer uri={previewUri} filename={previewName ?? undefined} onClose={() => setPreviewUri(null)} />
        )}
      </Modal>
    </View>
  );
}
