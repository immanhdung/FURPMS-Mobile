// __MOCK__
import type {
  Notification,
  NotificationSummary,
  UnreadCountResponse,
} from '../types/notification.types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface NotificationService {
  getNotifications(): Promise<NotificationSummary[]>;
  getNotificationById(id: string): Promise<Notification>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  getUnreadCount(): Promise<UnreadCountResponse>;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-001',
    type: 'PROPOSAL_STATUS_CHANGED',
    title: 'Proposal Under Review',
    body: 'Your proposal "AI-Powered Student Performance Prediction System" is now under review by the committee.',
    isRead: false,
    createdAt: '2025-01-18T09:05:00Z',
    data: { proposalId: 'p-001' },
  },
  {
    id: 'n-002',
    type: 'MEETING_SCHEDULED',
    title: 'Meeting Scheduled',
    body: 'A review panel meeting has been scheduled for your proposal on March 25, 2025 at 9:00 AM.',
    isRead: false,
    createdAt: '2025-03-15T08:10:00Z',
    data: { meetingId: 'm-001', proposalId: 'p-001' },
  },
  {
    id: 'n-003',
    type: 'REVISION_REQUESTED',
    title: 'Revision Required',
    body: 'The review committee has requested revisions for your IoT Smart Campus proposal. Please review the feedback.',
    isRead: false,
    createdAt: '2025-02-15T11:05:00Z',
    data: { proposalId: 'p-003' },
  },
  {
    id: 'n-004',
    type: 'PROPOSAL_APPROVED',
    title: 'Proposal Approved',
    body: 'Congratulations! Your proposal "Blockchain-Based Academic Certificate Verification" has been approved.',
    isRead: true,
    createdAt: '2024-12-05T14:30:00Z',
    data: { proposalId: 'p-002' },
  },
  {
    id: 'n-005',
    type: 'MEETING_REMINDER',
    title: 'Meeting Reminder',
    body: 'Reminder: Research Committee Monthly Meeting tomorrow at 2:00 PM.',
    isRead: true,
    createdAt: '2025-03-27T09:00:00Z',
    data: { meetingId: 'm-002' },
  },
];

const mockNotificationService: NotificationService = {
  async getNotifications() {
    await delay(300);
    return MOCK_NOTIFICATIONS.map(({ data: _, ...n }) => n);
  },

  async getNotificationById(id) {
    await delay(200);
    const found = MOCK_NOTIFICATIONS.find((n) => n.id === id);
    if (!found) throw new Error(`Notification ${id} not found`);
    return found;
  },

  async markAsRead(_id) {
    await delay(150);
  },

  async markAllAsRead() {
    await delay(250);
  },

  async getUnreadCount() {
    await delay(150);
    const count = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
    return { count };
  },
};

export const notificationService: NotificationService = mockNotificationService;
