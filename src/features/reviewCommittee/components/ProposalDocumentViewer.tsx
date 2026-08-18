import { useState, useEffect, useMemo } from 'react';
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

  const [autoLoaded, setAutoLoaded] = useState(false);

  const pdfDocument = useMemo(() => {
    return documents?.find((doc) => {
      const decoded = decodeURIComponent(doc.fileName).toLowerCase();
      return decoded.endsWith('.pdf');
    });
  }, [documents]);

  async function handleView(documentId: string, fileName: string) {
    setOpeningId(documentId);
    try {
      const result = await download(proposalDocumentService.downloadPath(proposalId, documentId), fileName);
      if (!result) return;
      const isPdf = decodeURIComponent(fileName).toLowerCase().endsWith('.pdf') || result.mimeType === 'application/pdf';
      if (isPdf) {
        setPreviewUri(result.uri);
        setPreviewName(fileName);
      } else {
        await open(result.uri, result.mimeType);
      }
    } finally {
      setOpeningId(null);
    }
  }

  useEffect(() => {
    if (pdfDocument && !autoLoaded) {
      setAutoLoaded(true);
      handleView(pdfDocument.id, pdfDocument.fileName);
    }
  }, [pdfDocument, autoLoaded]);

  if (isLoading) return <LoadingState message={t('documentViewer.loading')} />;
  if (!documents || documents.length === 0) {
    return <EmptyState fullScreen={false} icon="📄" title={t('documentViewer.emptyTitle')} description={t('documentViewer.emptyDescription')} />;
  }

  if (previewUri) {
    return (
      <View style={{ height: 650 }} className="rounded-24 overflow-hidden border border-neutral-200 dark:border-dark-200 mb-5">
        <PDFViewer
          uri={previewUri}
          filename={previewName ? decodeURIComponent(previewName) : undefined}
          onClose={documents.length > 1 ? () => setPreviewUri(null) : undefined}
        />
      </View>
    );
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
                {decodeURIComponent(doc.fileName)}
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

      {openingId && isDownloading && (
        <GlassSurface rounded={16} className="p-4 items-center">
          <Text className="text-sm text-neutral-600 dark:text-neutral-300">
            Đang tải tài liệu: {progress?.percentage ?? 0}%
          </Text>
        </GlassSurface>
      )}
    </View>
  );
}
