import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deliverableService } from '../services/deliverable.service';
import type { SubmitDeliverablePayload } from '../types/deliverable.types';

const key = (contractId: string) => ['deliverables', contractId] as const;
export function useDeliverables(contractId?: string) {
  return useQuery({ queryKey: key(contractId ?? ''), queryFn: () => deliverableService.list(contractId!), enabled: !!contractId });
}
export function useSubmitDeliverable(contractId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SubmitDeliverablePayload }) => deliverableService.submit(id, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: key(contractId) }),
  });
}
