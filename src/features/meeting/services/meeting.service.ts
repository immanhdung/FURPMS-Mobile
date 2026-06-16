// __MOCK__
import type {
  Meeting,
  MeetingSummary,
  MeetingFilters,
} from '../types/meeting.types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface MeetingService {
  getMeetings(filters?: MeetingFilters): Promise<MeetingSummary[]>;
  getMeetingById(id: string): Promise<Meeting>;
}

const MOCK_MEETINGS: MeetingSummary[] = [
  {
    id: 'm-001',
    title: 'Review Panel: AI Performance Prediction Proposal',
    type: 'REVIEW',
    status: 'UPCOMING',
    scheduledAt: '2025-03-25T09:00:00Z',
    durationMinutes: 90,
    participantCount: 6,
    linkedProposalTitle: 'AI-Powered Student Performance Prediction System',
    hasMinutes: false,
  },
  {
    id: 'm-002',
    title: 'Research Committee Monthly Meeting',
    type: 'GENERAL',
    status: 'UPCOMING',
    scheduledAt: '2025-03-28T14:00:00Z',
    durationMinutes: 60,
    participantCount: 12,
    hasMinutes: false,
  },
  {
    id: 'm-003',
    title: 'Review Panel: Blockchain Certificate Verification',
    type: 'REVIEW',
    status: 'COMPLETED',
    scheduledAt: '2024-12-10T09:00:00Z',
    durationMinutes: 75,
    participantCount: 5,
    linkedProposalTitle: 'Blockchain-Based Academic Certificate Verification',
    hasMinutes: true,
  },
  {
    id: 'm-004',
    title: 'IoT Project Discussion & Revision Guidance',
    type: 'DISCUSSION',
    status: 'COMPLETED',
    scheduledAt: '2025-02-20T10:00:00Z',
    durationMinutes: 45,
    participantCount: 4,
    linkedProposalTitle: 'IoT Smart Campus Energy Management',
    hasMinutes: true,
  },
];

const MOCK_MEETING_DETAIL: Meeting = {
  id: 'm-001',
  title: 'Review Panel: AI Performance Prediction Proposal',
  type: 'REVIEW',
  status: 'UPCOMING',
  scheduledAt: '2025-03-25T09:00:00Z',
  durationMinutes: 90,
  location: 'Room 401, FPT University HCM',
  videoLink: 'https://meet.google.com/mock-link',
  linkedProposalId: 'p-001',
  linkedProposalTitle: 'AI-Powered Student Performance Prediction System',
  participants: [
    { id: 'u-001', name: 'Nguyen Van An', email: 'faculty@fpt.edu.vn', role: 'Presenter' },
    { id: 'u-002', name: 'Tran Thi Bich', email: 'reviewer@fpt.edu.vn', role: 'Reviewer' },
    { id: 'u-007', name: 'Dao Minh Khanh', email: 'khanh@fpt.edu.vn', role: 'Reviewer' },
    { id: 'u-008', name: 'Nguyen Thi Lan', email: 'lan@fpt.edu.vn', role: 'Reviewer' },
    { id: 'u-009', name: 'Admin', email: 'admin@fpt.edu.vn', role: 'Chair' },
  ],
  agenda: [
    { id: 'a-001', order: 1, title: 'Opening & introduction', durationMinutes: 5, presenter: 'Admin' },
    { id: 'a-002', order: 2, title: 'Proposal presentation by PI', durationMinutes: 20, presenter: 'Nguyen Van An' },
    { id: 'a-003', order: 3, title: 'Q&A session', durationMinutes: 30 },
    { id: 'a-004', order: 4, title: 'Committee deliberation (closed)', durationMinutes: 25 },
    { id: 'a-005', order: 5, title: 'Decision announcement', durationMinutes: 10 },
  ],
  createdBy: 'u-009',
  createdAt: '2025-03-15T08:00:00Z',
};

const mockMeetingService: MeetingService = {
  async getMeetings(filters) {
    await delay(350);
    let results = [...MOCK_MEETINGS];

    if (filters?.status) {
      results = results.filter((m) => m.status === filters.status);
    }
    if (filters?.type) {
      results = results.filter((m) => m.type === filters.type);
    }
    if (filters?.upcoming) {
      results = results.filter((m) => m.status === 'UPCOMING');
    }

    return results.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
  },

  async getMeetingById(_id) {
    await delay(400);
    return MOCK_MEETING_DETAIL;
  },
};

export const meetingService: MeetingService = mockMeetingService;
