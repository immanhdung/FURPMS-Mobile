import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { amendmentService } from '../services/amendment.service';
import type { CreateAmendmentPayload } from '../types/amendment.types';
const key = (id: string) => ['amendments', id] as const;
export const useAmendments = (contractId?: string) => useQuery({ queryKey: key(contractId ?? ''), queryFn: () => amendmentService.list(contractId!), enabled: !!contractId });
export const useAmendmentCategories = () => useQuery({ queryKey: ['amendment-categories'], queryFn: amendmentService.categories });
export function useCreateAmendment(contractId: string) { const client = useQueryClient(); return useMutation({ mutationFn: (p: CreateAmendmentPayload) => amendmentService.create(contractId, p), onSuccess: () => client.invalidateQueries({ queryKey: key(contractId) }) }); }
