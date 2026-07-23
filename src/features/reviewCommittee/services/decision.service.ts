import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { DecisionResponse, SaveMinutesPayload } from '../types/decision.types';

export const decisionService = {
  async get(councilId: string): Promise<DecisionResponse | null> {
    const { data } = await httpClient.get<ApiResponse<DecisionResponse | null>>(`/review-scoring/councils/${councilId}/decision`);
    return data.data;
  },

  async saveMinutes(councilId: string, payload: SaveMinutesPayload): Promise<DecisionResponse> {
    const { data } = await httpClient.post<ApiResponse<DecisionResponse>>(
      `/review-scoring/councils/${councilId}/minutes`,
      payload,
    );
    return data.data;
  },

  async approveMinutes(councilId: string): Promise<DecisionResponse> {
    const { data } = await httpClient.post<ApiResponse<DecisionResponse>>(
      `/review-scoring/councils/${councilId}/minutes/approve`,
    );
    return data.data;
  },
};
