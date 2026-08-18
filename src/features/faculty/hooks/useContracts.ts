import { useQuery } from '@tanstack/react-query';
import { contractService } from '../services/contract.service';

export function useMyContracts() {
  return useQuery({
    queryKey: ['contracts', 'mine'],
    queryFn: () => contractService.list(),
    staleTime: 0,
    gcTime: 0,
  });
}
