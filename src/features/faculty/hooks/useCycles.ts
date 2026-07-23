import { useQuery } from '@tanstack/react-query';
import { cycleService } from '../services/cycle.service';
import { CYCLE_STATUS } from '@/constants/statuses';

export function useOpenCycles() {
  const query = useQuery({
    queryKey: ['cycles', 'all'],
    queryFn: () => cycleService.list(),
  });
  return { ...query, data: query.data?.filter((c) => c.status === CYCLE_STATUS.OPEN) };
}
