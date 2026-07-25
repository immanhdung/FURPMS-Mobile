import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { UpdateProgressReportPayload, ProgressReport } from '../types/progress-report.types';

export const progressReportService = {
  // Report slots (period + due date) are scheduled by staff on the web app — the PI only lists
  // and fills in the ones already on their contract, never creates new ones from mobile.
  async listByContract(contractId: string): Promise<ProgressReport[]> {
    const { data } = await httpClient.get<ApiResponse<ProgressReport[]>>('/progress-reports', { params: { contractId } });
    return data.data;
  },

  async update(id: string, payload: UpdateProgressReportPayload): Promise<ProgressReport> {
    const { data } = await httpClient.patch<ApiResponse<ProgressReport>>(`/progress-reports/${id}`, payload);
    return data.data;
  },

  async submit(id: string): Promise<ProgressReport> {
    const { data } = await httpClient.post<ApiResponse<ProgressReport>>(`/progress-reports/${id}/submit`);
    return data.data;
  },
};
