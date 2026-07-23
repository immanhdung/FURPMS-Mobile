import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { FinalReport, SubmitFinalReportPayload } from '../types/final-report.types';

export const finalReportService = {
  async getByContract(contractId: string): Promise<FinalReport | null> {
    const { data } = await httpClient.get<ApiResponse<FinalReport | null>>(`/final-reports/${contractId}`);
    return data.data;
  },

  async submit(contractId: string, payload: SubmitFinalReportPayload): Promise<FinalReport> {
    const { data } = await httpClient.post<ApiResponse<FinalReport>>(`/final-reports/${contractId}/submit`, payload);
    return data.data;
  },
};
