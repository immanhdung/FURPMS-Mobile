export type MeetingType = 'REVIEW' | 'DISCUSSION' | 'GENERAL';

export type MeetingStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  attended?: boolean;
}

export interface AgendaItem {
  id: string;
  order: number;
  title: string;
  description?: string;
  durationMinutes?: number;
  presenter?: string;
}

export interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  status: MeetingStatus;
  scheduledAt: string;
  durationMinutes: number;
  location?: string;
  videoLink?: string;
  linkedProposalId?: string;
  linkedProposalTitle?: string;
  participants: Participant[];
  agenda: AgendaItem[];
  minutes?: string;
  createdBy: string;
  createdAt: string;
}

export interface MeetingSummary {
  id: string;
  title: string;
  type: MeetingType;
  status: MeetingStatus;
  scheduledAt: string;
  durationMinutes: number;
  participantCount: number;
  linkedProposalTitle?: string;
  hasMinutes: boolean;
}

export interface MeetingFilters {
  status?: MeetingStatus;
  type?: MeetingType;
  upcoming?: boolean;
}
