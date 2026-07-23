import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { AcceptancePayload, AcceptanceResponse } from '../types/acceptance.types';

export const acceptanceService = {
  async get(councilId: string): Promise<AcceptanceResponse | null> {
    const { data } = await httpClient.get<ApiResponse<AcceptanceResponse | null>>(`/councils/${councilId}/acceptance`);
    return data.data;
  },

  async submit(councilId: string, payload: AcceptancePayload): Promise<AcceptanceResponse> {
    const { data } = await httpClient.post<ApiResponse<AcceptanceResponse>>(`/councils/${councilId}/acceptance`, payload);
    return data.data;
  },
};
