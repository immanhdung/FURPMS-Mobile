export type ProposalStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED';

export type TeamMemberRole = 'PI' | 'CO_PI' | 'MEMBER';

export type BudgetCategory = 'PERSONNEL' | 'EQUIPMENT' | 'OVERHEAD' | 'OTHER';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  department?: string;
}

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  description: string;
  amount: number;
}

export interface CriteriaScore {
  name: string;
  score: number;
  maxScore: number;
  comment?: string;
}

export interface ReviewFeedback {
  id: string;
  reviewerId: string;
  reviewerName: string;
  criteriaScores: CriteriaScore[];
  overallScore: number;
  feedback: string;
  decision: 'APPROVE' | 'REJECT' | 'REVISION_REQUIRED';
  revisionInstructions?: string;
  submittedAt: string;
}

export interface StatusHistoryItem {
  status: ProposalStatus;
  timestamp: string;
  note?: string;
  actorName?: string;
}

export interface Proposal {
  id: string;
  title: string;
  abstract: string;
  researchField: string;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  startDate: string;
  endDate: string;
  budget: number;
  budgetItems: BudgetItem[];
  team: TeamMember[];
  objectives: string;
  methodology: string;
  expectedOutcomes: string;
  statusHistory: StatusHistoryItem[];
  reviews: ReviewFeedback[];
  ownerId: string;
  ownerName: string;
}

export interface ProposalSummary {
  id: string;
  title: string;
  status: ProposalStatus;
  researchField: string;
  budget: number;
  submittedAt?: string;
  updatedAt: string;
  team: Pick<TeamMember, 'id' | 'name'>[];
}

export interface ProposalStats {
  total: number;
  draft: number;
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
  revisionRequired: number;
}

export interface CreateProposalDTO {
  title: string;
  abstract: string;
  researchField: string;
  startDate: string;
  endDate: string;
  budget: number;
  budgetItems: Omit<BudgetItem, 'id'>[];
  team: Omit<TeamMember, 'id'>[];
  objectives: string;
  methodology: string;
  expectedOutcomes: string;
}

export interface ProposalFilters {
  status?: ProposalStatus;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'budget';
  sortOrder?: 'asc' | 'desc';
}
