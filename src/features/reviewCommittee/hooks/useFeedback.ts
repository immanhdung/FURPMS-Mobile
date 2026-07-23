import { useQuery } from '@tanstack/react-query';
import { feedbackService } from '../services/feedback.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { ApiError } from '@/types/common';

export function useFeedback(councilId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.feedback.byCouncil(councilId),
    queryFn: async () => {
      try {
        return { feedback: await feedbackService.list(councilId), forbidden: false };
      } catch (err) {
        if ((err as ApiError).status === 403) return { feedback: [], forbidden: true };
        throw err;
      }
    },
    enabled: !!councilId,
  });
}
