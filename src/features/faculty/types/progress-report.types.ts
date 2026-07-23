export interface ProgressReport {
  id: string;
  contractId: string;
  period?: string | null;
  completedContent?: string | null;
  pendingContent?: string | null;
  overallCompletionPct?: number | null;
  expenditureToDate?: number | null;
  nextPeriodPlan?: string | null;
  piRecommendations?: string | null;
  status?: string | null;
  dueDate?: string | null;
  scheduledMeetingAt?: string | null;
  meetingLink?: string | null;
  evaluationResult?: string | null;
  evaluationComments?: string | null;
  submittedAt?: string | null;
}

export interface CreateProgressReportPayload {
  period?: string;
  completedContent?: string;
  pendingContent?: string;
  overallCompletionPct?: number;
  expenditureToDate?: number;
  nextPeriodPlan?: string;
  piRecommendations?: string;
}
