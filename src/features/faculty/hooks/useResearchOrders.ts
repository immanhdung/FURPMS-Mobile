import { useQuery } from '@tanstack/react-query';
import { researchOrderService } from '../services/research-order.service';
import type { ResearchOrderListParams } from '../types/research-order.types';

export function useResearchOrders(params?: ResearchOrderListParams) {
  return useQuery({
    queryKey: ['research-orders', params],
    queryFn: () => researchOrderService.list(params),
    enabled: !!params?.cycleId,
  });
}
