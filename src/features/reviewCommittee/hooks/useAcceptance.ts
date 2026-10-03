import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { acceptanceService } from '../services/acceptance.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { AcceptancePayload } from '../types/acceptance.types';

export function useAcceptance(councilId: string, projectId?: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.acceptance.byCouncil(councilId),
    queryFn: () => acceptanceService.get(councilId, projectId!),
    enabled: !!councilId && !!projectId,
  });
}

export function useSubmitAcceptance(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AcceptancePayload) => acceptanceService.submit(councilId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.acceptance.byCouncil(councilId) });
    },
  });
}

