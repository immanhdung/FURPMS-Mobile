import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/review.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { SubmitReviewDTO } from '../types/review.types';

export function useReviewQueue() {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.queue,
    queryFn: () => reviewService.getQueue(),
  });
}

export function useReviewSubmission(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.detail(id),
    queryFn: () => reviewService.getSubmissionById(id),
    enabled: !!id,
  });
}

export function useCompletedReviews() {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.completed,
    queryFn: () => reviewService.getCompletedReviews(),
  });
}

export function useReviewQueueStats() {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.stats,
    queryFn: () => reviewService.getQueueStats(),
  });
}

export function useReviewCriteria(submissionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.criteria(submissionId),
    queryFn: () => reviewService.getScoringCriteria(submissionId),
    enabled: !!submissionId,
  });
}

export function useAISummary(submissionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.aiSummary(submissionId),
    queryFn: () => reviewService.getAISummary(submissionId),
    enabled: !!submissionId,
  });
}

export function useReviewResult(submissionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.result(submissionId),
    queryFn: () => reviewService.getReviewResult(submissionId),
    enabled: !!submissionId,
  });
}

export function useSubmitReview(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitReviewDTO) =>
      reviewService.submitReview(submissionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews.all });
    },
  });
}
