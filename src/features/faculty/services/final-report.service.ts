import { httpClient } from '@/services/http.client';
import { uploadService, type PickedFile, type UploadedFile, type UploadProgressCallback } from '@/services/upload.service';
import type { ApiResponse } from '@/types/common';
import type { ProposalDocument } from '../types/proposal-document.types';
import type { FinalReport, SubmitFinalReportPayload } from '../types/final-report.types';

export type FinalReportDocumentType = 'REPORT' | 'SUMMARY';

export const finalReportService = {
  async getByContract(contractId: string): Promise<FinalReport | null> {
    const { data } = await httpClient.get<ApiResponse<FinalReport | null>>(`/final-reports/${contractId}`);
    return data.data;
  },

  async submit(contractId: string, payload: SubmitFinalReportPayload): Promise<FinalReport> {
    const { data } = await httpClient.post<ApiResponse<FinalReport>>(`/final-reports/${contractId}/submit`, payload);
    return data.data;
  },

  async uploadDocument(
    contractId: string,
    file: PickedFile,
    documentType: FinalReportDocumentType,
    onProgress?: UploadProgressCallback,
  ): Promise<UploadedFile> {
    const doc = await uploadService.uploadFile<ProposalDocument>(
      file,
      `/final-reports/${contractId}/documents`,
      'file',
      { documentType },
      onProgress,
    );
    return {
      id: doc.id,
      name: decodeURIComponent(doc.fileName),
      url: doc.downloadUrl ?? '',
      size: doc.fileSizeBytes,
      mimeType: file.mimeType,
      uploadedAt: doc.uploadedAt,
    };
  },
};
