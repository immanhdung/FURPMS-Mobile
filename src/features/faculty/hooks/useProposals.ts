import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalService } from '../services/proposal.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { PROPOSAL_STATUS } from '@/constants/statuses';
import type { ProposalPayload } from '../types/proposal.types';

export function useMyProposals() {
  return useQuery({
    queryKey: QUERY_KEYS.proposals.mine,
    queryFn: () => proposalService.mine(),
  });
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.proposals.detail(id),
    queryFn: () => proposalService.getById(id),
    enabled: !!id,
  });
}

/** The real backend has no /proposals/stats endpoint — derive counts from the already-fetched
 *  /proposals/my list instead of a dedicated request. */
export function useProposalStats() {
  const { data, ...rest } = useMyProposals();
  const proposals = data ?? [];
  const stats = {
    total: proposals.length,
    draft: proposals.filter((p) => p.status === PROPOSAL_STATUS.DRAFT).length,
    submitted: proposals.filter((p) => p.status === PROPOSAL_STATUS.SUBMITTED).length,
    underReview: proposals.filter((p) => p.status === PROPOSAL_STATUS.UNDER_REVIEW).length,
    approved: proposals.filter((p) => p.status === PROPOSAL_STATUS.APPROVED).length,
    rejected: proposals.filter((p) => p.status === PROPOSAL_STATUS.REJECTED).length,
    withdrawn: proposals.filter((p) => p.status === PROPOSAL_STATUS.WITHDRAWN).length,
  };
  return { ...rest, data: stats };
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProposalPayload) => proposalService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.mine });
    },
  });
}

export function useUpdateProposal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProposalPayload) => proposalService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.mine });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.detail(id) });
    },
  });
}

export function useSubmitProposal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (confirmCv: boolean) => proposalService.submit(id, confirmCv),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.mine });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.detail(id) });
    },
  });
}

export function useWithdrawProposal(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => proposalService.withdraw(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.mine });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.detail(id) });
    },
  });
}
