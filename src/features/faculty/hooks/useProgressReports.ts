import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressReportService } from '../services/progress-report.service';
import type { CreateProgressReportPayload } from '../types/progress-report.types';

function queryKey(contractId: string) {
  return ['progress-reports', contractId] as const;
}

export function useProgressReports(contractId?: string) {
  return useQuery({
    queryKey: queryKey(contractId ?? ''),
    queryFn: () => progressReportService.listByContract(contractId!),
    enabled: !!contractId,
  });
}

export function useCreateProgressReport(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProgressReportPayload) => progressReportService.create(contractId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(contractId) });
    },
  });
}

export function useSubmitProgressReport(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => progressReportService.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(contractId) });
    },
  });
}
