import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { Deliverable, SubmitDeliverablePayload } from '../types/deliverable.types';

export const deliverableService = {
  async list(contractId: string): Promise<Deliverable[]> {
    const { data } = await httpClient.get<ApiResponse<Deliverable[]>>(`/contracts/${contractId}/deliverables`);
    return data.data;
  },
  async submit(id: number, payload: SubmitDeliverablePayload): Promise<Deliverable> {
    const { data } = await httpClient.post<ApiResponse<Deliverable>>(`/deliverables/${id}/submit`, payload);
    return data.data;
  },
};
