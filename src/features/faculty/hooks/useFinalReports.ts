import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { finalReportService } from '../services/final-report.service';
import type { SubmitFinalReportPayload } from '../types/final-report.types';

function queryKey(contractId: string) {
  return ['final-report', contractId] as const;
}

export function useFinalReport(contractId?: string) {
  return useQuery({
    queryKey: queryKey(contractId ?? ''),
    queryFn: () => finalReportService.getByContract(contractId!),
    enabled: !!contractId,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useSubmitFinalReport(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitFinalReportPayload) => finalReportService.submit(contractId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(contractId) });
    },
  });
}
