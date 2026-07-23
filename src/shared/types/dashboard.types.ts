export interface KpiDatum {
  id: string;
  label: string;
  value: number | string;
  format?: string | null;
  deltaLabel?: string | null;
}

export interface ActivityItem {
  id: string;
  message: string;
  actor?: string | null;
  timestamp: string;
  type?: string | null;
}

export interface ProposalStatusSlice {
  status: string;
  count: number;
}

export interface DeadlineBucket {
  label: string;
  dueDate?: string | null;
  count: number;
}

export interface PiDashboardData {
  kpis: KpiDatum[];
  proposalStatus: ProposalStatusSlice[];
  upcomingDeadlines: DeadlineBucket[];
  aiSuggestions: string[];
  activity: ActivityItem[];
}

export interface ReviewProgressPoint {
  label: string;
  completed: number;
  pending: number;
}

export interface ReviewDecisionSlice {
  decision: string;
  count: number;
}

export interface ReviewerDashboardData {
  kpis: KpiDatum[];
  reviewCompletionTrend: ReviewProgressPoint[];
  reviewDecisions: ReviewDecisionSlice[];
  activity: ActivityItem[];
}
