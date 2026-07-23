import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewScoringService } from '../services/review-scoring.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { ApiError } from '@/types/common';
import type { SubmitScorePayload } from '../types/review-scoring.types';

export function useRubrics() {
  return useQuery({
    queryKey: QUERY_KEYS.rubrics.all,
    queryFn: () => reviewScoringService.listRubrics(),
    staleTime: 1000 * 60 * 30,
  });
}

export function useMyScore(councilId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.scores.mine(councilId),
    queryFn: () => reviewScoringService.getMyScore(councilId),
    enabled: !!councilId,
  });
}

/** 403 (not permitted to view all scores, e.g. a plain Member) degrades to an empty list with
 *  `forbidden: true` instead of an error state — the Minutes tab must render this gracefully. */
export function useAllScores(councilId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.scores.all(councilId),
    queryFn: async () => {
      try {
        return { scores: await reviewScoringService.getAllScores(councilId), forbidden: false };
      } catch (err) {
        if ((err as ApiError).status === 403) return { scores: [], forbidden: true };
        throw err;
      }
    },
    enabled: !!councilId,
  });
}

export function useSubmitScore(councilId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitScorePayload) => reviewScoringService.submitScore(councilId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.scores.mine(councilId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.scores.all(councilId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.decisions.byCouncil(councilId) });
    },
  });
}
