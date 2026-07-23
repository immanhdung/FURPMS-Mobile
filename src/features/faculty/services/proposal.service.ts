import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { ProposalDetail, ProposalPayload, ProposalSummary } from '../types/proposal.types';

export const proposalService = {
  async mine(): Promise<ProposalSummary[]> {
    const { data } = await httpClient.get<ApiResponse<ProposalSummary[]>>('/proposals/my');
    return data.data;
  },

  async getById(id: string): Promise<ProposalDetail> {
    const { data } = await httpClient.get<ApiResponse<ProposalDetail>>(`/proposals/${id}`);
    return data.data;
  },

  async create(payload: ProposalPayload): Promise<ProposalDetail> {
    const { data } = await httpClient.post<ApiResponse<ProposalDetail>>('/proposals', payload);
    return data.data;
  },

  async update(id: string, payload: ProposalPayload): Promise<ProposalDetail> {
    const { data } = await httpClient.put<ApiResponse<ProposalDetail>>(`/proposals/${id}`, payload);
    return data.data;
  },

  async submit(id: string, confirmCv: boolean): Promise<ProposalDetail> {
    const { data } = await httpClient.post<ApiResponse<ProposalDetail>>(
      `/proposals/${id}/submit`,
      undefined,
      { params: { confirmCv } },
    );
    return data.data;
  },

  async withdraw(id: string): Promise<ProposalDetail> {
    const { data } = await httpClient.patch<ApiResponse<ProposalDetail>>(`/proposals/${id}/withdraw`);
    return data.data;
  },
};
