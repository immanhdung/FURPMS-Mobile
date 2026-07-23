import { httpClient } from '@/services/http.client';
import type {
  ReviewSubmission,
  ReviewSubmissionSummary,
  ReviewQueueStats,
  SubmitReviewDTO,
  ReviewResult,
  ScoringCriteria,
  AISummary,
} from '../types/review.types';

export interface ReviewService {
  getQueue(): Promise<ReviewSubmissionSummary[]>;
  getSubmissionById(id: string): Promise<ReviewSubmission>;
  getCompletedReviews(): Promise<ReviewSubmissionSummary[]>;
  getQueueStats(): Promise<ReviewQueueStats>;
  getScoringCriteria(submissionId: string): Promise<ScoringCriteria[]>;
  getAISummary(submissionId: string): Promise<AISummary>;
  getReviewResult(submissionId: string): Promise<ReviewResult>;
  submitReview(submissionId: string, data: SubmitReviewDTO): Promise<ReviewResult>;
}

const realReviewService: ReviewService = {
  async getQueue() {
    const { data } = await httpClient.get<ReviewSubmissionSummary[]>('/reviews/queue');
    return data;
  },

  async getSubmissionById(id) {
    const { data } = await httpClient.get<ReviewSubmission>(`/reviews/${id}`);
    return data;
  },

  async getCompletedReviews() {
    const { data } = await httpClient.get<ReviewSubmissionSummary[]>('/reviews/completed');
    return data;
  },

  async getQueueStats() {
    const { data } = await httpClient.get<ReviewQueueStats>('/reviews/stats');
    return data;
  },

  async getScoringCriteria(submissionId) {
    const { data } = await httpClient.get<ScoringCriteria[]>(
      `/reviews/${submissionId}/criteria`,
    );
    return data;
  },

  async getAISummary(submissionId) {
    const { data } = await httpClient.get<AISummary>(
      `/reviews/${submissionId}/ai-summary`,
    );
    return data;
  },

  async getReviewResult(submissionId) {
    const { data } = await httpClient.get<ReviewResult>(
      `/reviews/${submissionId}/result`,
    );
    return data;
  },

  async submitReview(submissionId, payload) {
    const { data } = await httpClient.post<ReviewResult>(
      `/reviews/${submissionId}/submit`,
      payload,
    );
    return data;
  },
};

export const reviewService: ReviewService = realReviewService;
