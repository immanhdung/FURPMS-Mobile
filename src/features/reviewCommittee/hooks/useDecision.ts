import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { decisionService } from '../services/decision.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { SaveMinutesPayload } from '../types/decision.types';

export function useDecision(councilId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.decisions.byCouncil(councilId),
    queryFn: () => decisionService.get(councilId),
    enabled: !!councilId,
  });
}

export function useSaveMinutes(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveMinutesPayload) => decisionService.saveMinutes(councilId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.decisions.byCouncil(councilId) });
    },
  });
}

/** The one mutation that flips the proposal's status server-side — irreversible. */
export function useApproveMinutes(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => decisionService.approveMinutes(councilId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.decisions.byCouncil(councilId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.memberships.mine });
    },
  });
}
