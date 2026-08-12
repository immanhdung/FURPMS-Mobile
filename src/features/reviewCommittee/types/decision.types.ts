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
  qaEntries?: QaEntry[] | null;
  memberOpinions?: MemberOpinion[] | null;
}
export interface QaEntry { askedBy?: string | null; question: string; answer?: string | null; order: number; }
export interface MemberOpinion { memberName: string; academicComment?: string | null; budgetComment?: string | null; order: number; }

export interface SaveMinutesPayload {
  projectId?: string;
  result: string;
  councilComments?: string;
  recommendations?: string;
  qaEntries?: QaEntry[];
  memberOpinions?: MemberOpinion[];
}
