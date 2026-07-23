export const MEETING_PLATFORMS = ['Google Meet', 'Microsoft Teams'] as const;
export type MeetingPlatform = (typeof MEETING_PLATFORMS)[number];

/** Matches web's Meeting type — the real backend has no participants/agenda-items/minutes
 *  structure, only a free-text agenda string. No GET /meetings/{id} exists either; screens must
 *  select a meeting out of the already-fetched list. The proposal/council title isn't part of
 *  this response — screens that need it join against `useMyMemberships()` by `councilId`. */
export interface Meeting {
  id: string;
  councilId: string;
  title?: string | null;
  platform?: MeetingPlatform | string | null;
  meetingLink?: string | null;
  scheduledAt: string;
  durationMinutes: number;
  agenda?: string | null;
  status?: string | null;
}
