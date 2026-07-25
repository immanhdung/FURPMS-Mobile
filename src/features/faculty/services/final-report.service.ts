import { httpClient } from '@/services/http.client';
import { uploadService, type PickedFile, type UploadedFile, type UploadProgressCallback } from '@/services/upload.service';
import type { ApiResponse } from '@/types/common';
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
    return uploadService.uploadFile<UploadedFile>(
      file,
      `/final-reports/${contractId}/documents`,
      'file',
      { documentType },
      onProgress,
    );
  },
};
