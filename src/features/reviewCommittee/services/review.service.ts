// __MOCK__
import type {
  ReviewSubmission,
  ReviewSubmissionSummary,
  ReviewQueueStats,
  SubmitReviewDTO,
  ReviewResult,
} from '../types/review.types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface ReviewService {
  getQueue(): Promise<ReviewSubmissionSummary[]>;
  getSubmissionById(id: string): Promise<ReviewSubmission>;
  getCompletedReviews(): Promise<ReviewSubmissionSummary[]>;
  getQueueStats(): Promise<ReviewQueueStats>;
  submitReview(submissionId: string, data: SubmitReviewDTO): Promise<ReviewResult>;
}

const MOCK_QUEUE: ReviewSubmissionSummary[] = [
  {
    id: 'rs-001',
    proposalId: 'p-001',
    proposalTitle: 'AI-Powered Student Performance Prediction System',
    proposalField: 'Artificial Intelligence',
    assignedAt: '2025-01-18T09:00:00Z',
    dueDate: '2025-01-25T23:59:59Z',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
  },
  {
    id: 'rs-002',
    proposalId: 'p-005',
    proposalTitle: 'Computer Vision for Automated Lab Safety Monitoring',
    proposalField: 'Computer Vision',
    assignedAt: '2025-03-12T08:00:00Z',
    dueDate: '2025-03-20T23:59:59Z',
    status: 'PENDING',
    priority: 'MEDIUM',
  },
  {
    id: 'rs-003',
    proposalId: 'p-006',
    proposalTitle: 'Federated Learning for Privacy-Preserving Healthcare Analytics',
    proposalField: 'Machine Learning',
    assignedAt: '2025-03-14T10:00:00Z',
    dueDate: '2025-03-22T23:59:59Z',
    status: 'PENDING',
    priority: 'HIGH',
  },
];

const MOCK_COMPLETED: ReviewSubmissionSummary[] = [
  {
    id: 'rs-004',
    proposalId: 'p-002',
    proposalTitle: 'Blockchain-Based Academic Certificate Verification',
    proposalField: 'Blockchain Technology',
    assignedAt: '2024-11-12T09:00:00Z',
    dueDate: '2024-11-20T23:59:59Z',
    status: 'COMPLETED',
    priority: 'MEDIUM',
  },
];

const mockReviewService: ReviewService = {
  async getQueue() {
    await delay(400);
    return MOCK_QUEUE.filter((r) => r.status !== 'COMPLETED');
  },

  async getSubmissionById(_id) {
    await delay(500);
    // Return a mock submission with embedded proposal
    const { proposalService } = await import(
      '@/features/faculty/services/proposal.service'
    );
    const proposal = await proposalService.getProposalById('p-001');

    return {
      id: 'rs-001',
      proposalId: 'p-001',
      proposal,
      assignedAt: '2025-01-18T09:00:00Z',
      dueDate: '2025-01-25T23:59:59Z',
      status: 'IN_PROGRESS',
      reviewerId: 'u-002',
      reviewerName: 'Tran Thi Bich',
      priority: 'HIGH',
    };
  },

  async getCompletedReviews() {
    await delay(400);
    return MOCK_COMPLETED;
  },

  async getQueueStats() {
    await delay(250);
    return {
      pending: MOCK_QUEUE.filter((r) => r.status === 'PENDING').length,
      inProgress: MOCK_QUEUE.filter((r) => r.status === 'IN_PROGRESS').length,
      completed: MOCK_COMPLETED.length,
      overdue: 0,
    };
  },

  async submitReview(submissionId, data) {
    await delay(700);
    const totalScore =
      data.criteriaScores.reduce((sum, c) => sum + c.score, 0) /
      Math.max(data.criteriaScores.length, 1);

    return {
      submissionId,
      criteriaScores: data.criteriaScores,
      overallScore: Math.round(totalScore * 10) / 10,
      feedback: data.feedback,
      revisionInstructions: data.revisionInstructions,
      decision: data.decision,
      submittedAt: new Date().toISOString(),
    };
  },
};

export const reviewService: ReviewService = mockReviewService;
