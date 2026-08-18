export interface ProgressReportItem {
  id: number;
  activityId: number;
  activityName: string;
  completionRate: number;
  completionStatus: string;
  evidenceDescription?: string | null;
  notes?: string | null;
}

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
  reportFileUrl?: string | null;
  items?: ProgressReportItem[] | null;
}

// PI can only fill in content for a report slot staff already scheduled (period/dueDate are
// staff-set and not part of this payload) — see ProgressReportsTab in app/(faculty)/reports.
export interface UpdateProgressReportPayload {
  completedContent?: string;
  pendingContent?: string;
  overallCompletionPct?: number;
  expenditureToDate?: number;
  nextPeriodPlan?: string;
  piRecommendations?: string;
  reportFileUrl?: string;
  items?: {
    activityId: number;
    completionRate: number;
    completionStatus: string;
    notes?: string;
  }[];
}
