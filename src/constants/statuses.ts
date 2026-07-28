// Ported from furpms-web/src/constants/statuses.ts — keep in sync with the real backend
// contract confirmed there. Only the subset relevant to the PI/Reviewer mobile app is kept.

export const PROPOSAL_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
} as const;
export type ProposalStatus = (typeof PROPOSAL_STATUS)[keyof typeof PROPOSAL_STATUS];

export const CYCLE_STATUS = {
  PLANNING: 'PLANNING',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const;
export type CycleStatus = (typeof CYCLE_STATUS)[keyof typeof CYCLE_STATUS];

/** Confirmed live: the backend returns Title-case ("Open"/"Planning"/"Closed"), not the upper-case
 *  values above — compare case-insensitively rather than against `CYCLE_STATUS.OPEN` directly. */
export function isOpenCycle(status?: string | null): boolean {
  return status?.trim().toLowerCase() === 'open';
}

/** Confirmed live: the backend returns "INVITED" for an awaiting-response invitation, not "PENDING". */
export const INVITATION_STATUS = {
  PENDING: 'INVITED',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
} as const;
export type InvitationStatus = (typeof INVITATION_STATUS)[keyof typeof INVITATION_STATUS];

/** Backend may serialize the accepted state as "CONFIRMED" instead of "ACCEPTED" — treat both as accepted. */
export function isAcceptedInvitation(status?: string | null): boolean {
  const normalized = status?.toUpperCase();
  return normalized === INVITATION_STATUS.ACCEPTED || normalized === 'CONFIRMED';
}

/** Only Review and Acceptance (final) rounds are used — Screening was removed project-wide. */
export const REVIEW_ROUND_TYPE = {
  REVIEW: 'REVIEW',
  ACCEPTANCE: 'ACCEPTANCE',
} as const;
export type ReviewRoundType = (typeof REVIEW_ROUND_TYPE)[keyof typeof REVIEW_ROUND_TYPE];

export const ROUND_TYPE_LABELS: Record<ReviewRoundType, string> = {
  [REVIEW_ROUND_TYPE.REVIEW]: 'Review',
  [REVIEW_ROUND_TYPE.ACCEPTANCE]: 'Final',
};

/** PENDING before staff opens the round, OPEN once opened, CLOSED after closing. Scoring/acceptance forms are locked unless OPEN. */
export const ROUND_STATUS = {
  PENDING: 'PENDING',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const;
export type RoundStatus = (typeof ROUND_STATUS)[keyof typeof ROUND_STATUS];

export const REVIEW_DECISION = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REVISION_REQUIRED: 'REVISION_REQUIRED',
} as const;
export type ReviewDecision = (typeof REVIEW_DECISION)[keyof typeof REVIEW_DECISION];

/** Exact casing expected by the backend on write. Read-side comparisons should be case-insensitive
 *  (mirrors web's MinutesPanel chair/secretary check). */
export const COUNCIL_MEMBER_ROLE = {
  CHAIRMAN: 'Chairman',
  SECRETARY: 'Secretary',
  MEMBER: 'Member',
} as const;
export type CouncilMemberRole = (typeof COUNCIL_MEMBER_ROLE)[keyof typeof COUNCIL_MEMBER_ROLE];

export function isChairmanRole(role?: string | null): boolean {
  const r = role?.trim().toLowerCase();
  return r === 'chair' || r === 'chairman';
}

export function isSecretaryRole(role?: string | null): boolean {
  return role?.trim().toLowerCase() === 'secretary';
}

export const FINAL_REPORT_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  REVISION_REQUESTED: 'REVISION_REQUESTED',
  ACCEPTED: 'ACCEPTED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type FinalReportStatus = (typeof FINAL_REPORT_STATUS)[keyof typeof FINAL_REPORT_STATUS];

export const ACCEPTANCE_RESULTS = ['PASS', 'FAIL'] as const;
export type AcceptanceResult = (typeof ACCEPTANCE_RESULTS)[number];
