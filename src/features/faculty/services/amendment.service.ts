import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { Amendment, AmendmentCategory, CreateAmendmentPayload } from '../types/amendment.types';
export const amendmentService = {
  async list(contractId: string) { const { data } = await httpClient.get<ApiResponse<Amendment[]>>(`/contracts/${contractId}/amendments`); return data.data; },
  async categories() { const { data } = await httpClient.get<ApiResponse<AmendmentCategory[]>>('/amendment-categories', { params: { activeOnly: true } }); return data.data; },
  async create(contractId: string, payload: CreateAmendmentPayload) { const { data } = await httpClient.post<ApiResponse<Amendment>>(`/contracts/${contractId}/amendments`, payload); return data.data; },
};
