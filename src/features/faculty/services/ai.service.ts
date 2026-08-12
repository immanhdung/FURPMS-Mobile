import { uploadService, type PickedFile } from '@/services/upload.service';
import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { AiExtractionResult, SemanticSearchResult, ProposalSummaryAi } from '../types/ai.types';

// Only content extraction is ported to mobile — semantic search, similarity-check, and AI
// summary/feedback are cut as non-essential extras (see plan scope decisions).
export const aiService = {
  async extractFromFile(file: PickedFile): Promise<AiExtractionResult> {
    return uploadService.uploadFile<AiExtractionResult>(file, '/ai/extract', 'file');
  },
  async semanticSearch(query: string): Promise<SemanticSearchResult[]> {
    const { data } = await httpClient.post<ApiResponse<SemanticSearchResult[]>>('/ai/semantic-search', { query });
    return data.data;
  },
  async getProposalSummary(proposalId: string): Promise<ProposalSummaryAi | null> {
    const { data } = await httpClient.get<ApiResponse<ProposalSummaryAi | null>>(`/proposals/${proposalId}/summary`);
    return data.data;
  },
  async generateProposalSummary(proposalId: string): Promise<ProposalSummaryAi> {
    const { data } = await httpClient.post<ApiResponse<ProposalSummaryAi>>(`/proposals/${proposalId}/generate-summary`);
    return data.data;
  },
};
