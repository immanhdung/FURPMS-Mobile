import { useQuery } from '@tanstack/react-query';
import { cycleService } from '../services/cycle.service';
import { isOpenCycle } from '@/constants/statuses';

export function useOpenCycles() {
  const query = useQuery({
    queryKey: ['cycles', 'all'],
    queryFn: () => cycleService.list(),
  });
  return { ...query, data: query.data?.filter((c) => isOpenCycle(c.status)) };
}
