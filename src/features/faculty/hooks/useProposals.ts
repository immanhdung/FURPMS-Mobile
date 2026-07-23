import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalService } from '../services/proposal.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { ProposalFilters, CreateProposalDTO } from '../types/proposal.types';

export function useProposals(filters?: ProposalFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.proposals.list(filters),
    queryFn: () => proposalService.getProposals(filters),
  });
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.proposals.detail(id),
    queryFn: () => proposalService.getProposalById(id),
    enabled: !!id,
  });
}

export function useProposalStats() {
  return useQuery({
    queryKey: QUERY_KEYS.proposals.stats,
    queryFn: () => proposalService.getProposalStats(),
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProposalDTO) => proposalService.createProposal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.all });
    },
  });
}

export function useUpdateProposal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateProposalDTO>) =>
      proposalService.updateProposal(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.detail(id) });
    },
  });
}

export function useSubmitProposal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => proposalService.submitProposal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.detail(id) });
    },
  });
}

export function useDeleteProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proposalService.deleteProposal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.all });
    },
  });
}
