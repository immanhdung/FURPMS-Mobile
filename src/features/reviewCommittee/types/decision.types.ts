export interface DecisionResponse {
  id: string;
  councilId: string;
  totalMembers?: number | null;
  attendingMembers?: number | null;
  validBallots?: number | null;
  invalidBallots?: number | null;
  averageScore?: number | null;
  result?: string | null;
  councilComments?: string | null;
  recommendations?: string | null;
  chairUserId?: string | null;
  secretaryUserId?: string | null;
  finalizedAt?: string | null;
}

export interface SaveMinutesPayload {
  projectId?: string;
  result: string;
  councilComments?: string;
  recommendations?: string;
}
