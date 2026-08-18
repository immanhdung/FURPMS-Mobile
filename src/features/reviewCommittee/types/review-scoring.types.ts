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
  projectId?: string | null;
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
  evaluatorMemberId?: string | null;
  evaluatorName?: string | null;
  templateId: string;
  generalComments?: string | null;
  otherRecommendations?: string | null;
  scoreDetails?: ScoreDetailResponse[] | null;
  totalScore?: number | null;
  submittedAt?: string | null;
}

export interface MemberBallot {
  memberId: string;
  memberName: string;
  memberRole?: string | null;
  hasSubmitted: boolean;
  isValidBallot: boolean;
  totalScore?: number | null;
  maxScore?: number | null;
  result?: string | null;
  comments?: string | null;
  submittedAt?: string | null;
}

export interface BallotTally {
  councilId: string;
  projectId: string;
  isAcceptanceRound: boolean;
  totalMembers: number;
  ballotsReturned: number;
  validBallots: number;
  invalidBallots: number;
  passCount: number;
  failCount: number;
  averageScore?: number | null;
  ballots: MemberBallot[];
}
