import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { CreateProgressReportPayload, ProgressReport } from '../types/progress-report.types';

export const progressReportService = {
  async listByContract(contractId: string): Promise<ProgressReport[]> {
    const { data } = await httpClient.get<ApiResponse<ProgressReport[]>>('/progress-reports', { params: { contractId } });
    return data.data;
  },

  async create(contractId: string, payload: CreateProgressReportPayload): Promise<ProgressReport> {
    const { data } = await httpClient.post<ApiResponse<ProgressReport>>('/progress-reports', payload, { params: { contractId } });
    return data.data;
  },

  async submit(id: string): Promise<ProgressReport> {
    const { data } = await httpClient.post<ApiResponse<ProgressReport>>(`/progress-reports/${id}/submit`);
    return data.data;
  },
};
