import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { FeedbackResponse } from '../types/feedback.types';

export const feedbackService = {
  /** 403-tolerant, same as review-scoring's getAllScores — see caller for graceful handling. */
  async list(councilId: string): Promise<FeedbackResponse[]> {
    const { data } = await httpClient.get<ApiResponse<FeedbackResponse[]>>(`/councils/${councilId}/feedback`);
    return data.data;
  },
};
