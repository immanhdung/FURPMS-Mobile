import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalDocumentService } from '../services/proposal-document.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useProposalDocuments(proposalId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.proposals.documents(proposalId),
    queryFn: () => proposalDocumentService.list(proposalId),
    enabled: !!proposalId,
  });
}

export function useDeleteProposalDocument(proposalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => proposalDocumentService.remove(proposalId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.documents(proposalId) });
    },
  });
}
