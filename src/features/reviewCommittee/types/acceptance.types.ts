import type { AcceptanceResult } from '@/constants/statuses';

export interface AcceptanceResponse {
  id: string;
  councilId: string;
  result: AcceptanceResult;
  failReason?: string | null;
  submittedAt?: string | null;
}

export interface AcceptancePayload {
  projectId: string;
  result: AcceptanceResult;
  failReason?: string;
}
