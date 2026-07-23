export interface RubricTemplateCriterion {
  id: string;
  criterionName: string;
  maxScore: number;
  sequence?: number | null;
}

export interface RubricTemplate {
  id: string;
  templateType?: string | null;
  name?: string | null;
  maxTotalScore?: number | null;
  isActive?: boolean;
  criteria?: RubricTemplateCriterion[] | null;
}

export interface ScoreDetailPayload {
  criterionId: string;
  givenScore: number;
  comments?: string;
}

export interface SubmitScorePayload {
  templateId: string;
  generalComments?: string;
  otherRecommendations?: string;
  scoreDetails: ScoreDetailPayload[];
}

export interface ScoreDetailResponse {
  criterionId: string;
  criterionName?: string | null;
  givenScore: number;
  comments?: string | null;
}

export interface ScoreResponse {
  id: string;
  councilId: string;
  reviewerId?: string | null;
  reviewerName?: string | null;
  templateId: string;
  generalComments?: string | null;
  otherRecommendations?: string | null;
  scoreDetails?: ScoreDetailResponse[] | null;
  totalScore?: number | null;
  submittedAt?: string | null;
}
