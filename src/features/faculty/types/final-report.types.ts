import type { FinalReportStatus } from '@/constants/statuses';

export interface FinalReport {
  id: string;
  projectId: string;
  status?: FinalReportStatus | string | null;
  reportFileUrl?: string | null;
  summaryFileUrl?: string | null;
  language?: string | null;
  deadline?: string | null;
  submittedAt?: string | null;
  revisionNotes?: string | null;
  archivedAt?: string | null;
}

export interface SubmitFinalReportPayload {
  reportFileUrl: string;
  summaryFileUrl?: string;
  language: string;
}
