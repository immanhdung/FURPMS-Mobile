import { useQuery } from '@tanstack/react-query';
import { researchTypeService } from '../services/research-type.service';

export function useResearchTypes() {
  return useQuery({
    queryKey: ['research-types'],
    queryFn: () => researchTypeService.list(),
    staleTime: 1000 * 60 * 30,
  });
}
