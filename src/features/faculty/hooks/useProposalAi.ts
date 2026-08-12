import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiService } from '../services/ai.service';
import type { PickedFile } from '@/services/upload.service';

export function useExtractProposalMutation() {
  return useMutation({
    mutationFn: (file: PickedFile) => aiService.extractFromFile(file),
  });
}

export function useSemanticSearch() { return useMutation({ mutationFn: (query: string) => aiService.semanticSearch(query) }); }
export const useProposalSummary = (proposalId?: string) => useQuery({ queryKey: ['proposal-summary', proposalId], queryFn: () => aiService.getProposalSummary(proposalId!), enabled: !!proposalId });
export function useGenerateProposalSummary(proposalId: string) { const client = useQueryClient(); return useMutation({ mutationFn: () => aiService.generateProposalSummary(proposalId), onSuccess: () => client.invalidateQueries({ queryKey: ['proposal-summary', proposalId] }) }); }
