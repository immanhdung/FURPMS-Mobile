import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { ProposalDocument } from '../types/proposal-document.types';

export const proposalDocumentService = {
  async list(proposalId: string): Promise<ProposalDocument[]> {
    const { data } = await httpClient.get<ApiResponse<ProposalDocument[]>>(`/proposals/${proposalId}/documents`);
    return data.data;
  },

  async remove(proposalId: string, documentId: string): Promise<void> {
    await httpClient.delete<ApiResponse<null>>(`/proposals/${proposalId}/documents/${documentId}`);
  },

  downloadPath(proposalId: string, documentId: string): string {
    return `/proposals/${proposalId}/documents/${documentId}/download`;
  },
};
