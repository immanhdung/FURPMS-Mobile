import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { RubricTemplate, ScoreResponse, SubmitScorePayload, BallotTally } from '../types/review-scoring.types';

export const reviewScoringService = {
  async listRubrics(): Promise<RubricTemplate[]> {
    const { data } = await httpClient.get<ApiResponse<RubricTemplate[]>>('/review-scoring/rubrics');
    return data.data;
  },

  async getMyScore(councilId: string): Promise<ScoreResponse | null> {
    const { data } = await httpClient.get<ApiResponse<ScoreResponse | null>>(`/review-scoring/councils/${councilId}/scores/my`);
    return data.data;
  },

  async submitScore(councilId: string, payload: SubmitScorePayload): Promise<ScoreResponse> {
    const { data } = await httpClient.post<ApiResponse<ScoreResponse>>(`/review-scoring/councils/${councilId}/scores`, payload);
    return data.data;
  },

  /** 403 if the caller isn't permitted to see all scores (e.g. a plain Member) — callers must
   *  tolerate that status and degrade gracefully rather than erroring the whole screen. */
  async getAllScores(councilId: string): Promise<ScoreResponse[]> {
    const { data } = await httpClient.get<ApiResponse<ScoreResponse[]>>(`/review-scoring/councils/${councilId}/scores`);
    return data.data;
  },

  async ballotTally(councilId: string, projectId?: string): Promise<BallotTally> {
    const { data } = await httpClient.get<ApiResponse<BallotTally>>(`/review-scoring/councils/${councilId}/ballot-tally`, {
      params: projectId ? { projectId } : undefined,
    });
    return data.data;
  },
};
