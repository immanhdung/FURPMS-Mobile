import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expectedProductService } from '../services/expected-product.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { ExpectedProductPayload } from '../types/expected-product.types';

export function useExpectedProducts(proposalId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.proposals.expectedProducts(proposalId),
    queryFn: () => expectedProductService.list(proposalId),
    enabled: !!proposalId,
  });
}

export function useCreateExpectedProduct(proposalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExpectedProductPayload) => expectedProductService.create(proposalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.expectedProducts(proposalId) });
    },
  });
}

export function useDeleteExpectedProduct(proposalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => expectedProductService.remove(proposalId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals.expectedProducts(proposalId) });
    },
  });
}
