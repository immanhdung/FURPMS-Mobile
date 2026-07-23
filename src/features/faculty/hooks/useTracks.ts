import { useQuery } from '@tanstack/react-query';
import { trackService } from '../services/track.service';

export function useTracksByCycle(cycleId?: number) {
  return useQuery({
    queryKey: ['tracks', 'by-cycle', cycleId],
    queryFn: () => trackService.listByCycle(cycleId!),
    enabled: !!cycleId,
  });
}
