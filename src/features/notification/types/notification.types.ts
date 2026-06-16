export type NotificationType =
  | 'PROPOSAL_STATUS_CHANGED'
  | 'REVIEW_ASSIGNED'
  | 'REVIEW_SUBMITTED'
  | 'MEETING_SCHEDULED'
  | 'MEETING_REMINDER'
  | 'REVISION_REQUESTED'
  | 'PROPOSAL_APPROVED'
  | 'PROPOSAL_REJECTED'
  | 'GENERAL';

export interface NotificationData {
  proposalId?: string;
  meetingId?: string;
  reviewId?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data?: NotificationData;
}

export interface NotificationSummary {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}
