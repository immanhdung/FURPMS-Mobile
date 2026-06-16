import type { Proposal } from '@/features/faculty/types/proposal.types';

export type ReviewStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type ReviewDecision = 'APPROVE' | 'REJECT' | 'REVISION_REQUIRED';

export interface ScoringCriteria {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  weight: number;
}

export interface CriteriaScore {
  criteriaId: string;
  criteriaName: string;
  score: number;
  maxScore: number;
  comment?: string;
}

export interface ReviewSubmission {
  id: string;
  proposalId: string;
  proposal: Proposal;
  assignedAt: string;
  dueDate: string;
  status: ReviewStatus;
  reviewerId: string;
  reviewerName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ReviewSubmissionSummary {
  id: string;
  proposalId: string;
  proposalTitle: string;
  proposalField: string;
  assignedAt: string;
  dueDate: string;
  status: ReviewStatus;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SubmitReviewDTO {
  criteriaScores: CriteriaScore[];
  feedback: string;
  revisionInstructions?: string;
  decision: ReviewDecision;
}

export interface ReviewResult {
  submissionId: string;
  criteriaScores: CriteriaScore[];
  overallScore: number;
  feedback: string;
  revisionInstructions?: string;
  decision: ReviewDecision;
  submittedAt: string;
}

export interface ReviewQueueStats {
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}
