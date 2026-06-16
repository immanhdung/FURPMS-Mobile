// __MOCK__
import type {
  Proposal,
  ProposalSummary,
  ProposalStats,
  CreateProposalDTO,
  ProposalFilters,
} from '../types/proposal.types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface ProposalService {
  getProposals(filters?: ProposalFilters): Promise<ProposalSummary[]>;
  getProposalById(id: string): Promise<Proposal>;
  getProposalStats(): Promise<ProposalStats>;
  createProposal(data: CreateProposalDTO): Promise<Proposal>;
  updateProposal(id: string, data: Partial<CreateProposalDTO>): Promise<Proposal>;
  submitProposal(id: string): Promise<Proposal>;
  deleteProposal(id: string): Promise<void>;
}

const MOCK_PROPOSALS: ProposalSummary[] = [
  {
    id: 'p-001',
    title: 'AI-Powered Student Performance Prediction System',
    status: 'UNDER_REVIEW',
    researchField: 'Artificial Intelligence',
    budget: 45000000,
    submittedAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-01-20T10:30:00Z',
    team: [
      { id: 'u-001', name: 'Nguyen Van An' },
      { id: 'u-003', name: 'Le Van Cuong' },
    ],
  },
  {
    id: 'p-002',
    title: 'Blockchain-Based Academic Certificate Verification',
    status: 'APPROVED',
    researchField: 'Blockchain Technology',
    budget: 32000000,
    submittedAt: '2024-11-10T09:00:00Z',
    updatedAt: '2024-12-05T14:20:00Z',
    team: [
      { id: 'u-001', name: 'Nguyen Van An' },
    ],
  },
  {
    id: 'p-003',
    title: 'IoT Smart Campus Energy Management',
    status: 'REVISION_REQUIRED',
    researchField: 'Internet of Things',
    budget: 28000000,
    submittedAt: '2025-02-01T07:30:00Z',
    updatedAt: '2025-02-15T11:00:00Z',
    team: [
      { id: 'u-001', name: 'Nguyen Van An' },
      { id: 'u-004', name: 'Pham Thi Dung' },
      { id: 'u-005', name: 'Hoang Van Em' },
    ],
  },
  {
    id: 'p-004',
    title: 'Natural Language Processing for Vietnamese Education',
    status: 'DRAFT',
    researchField: 'Natural Language Processing',
    budget: 15000000,
    updatedAt: '2025-03-01T08:00:00Z',
    team: [
      { id: 'u-001', name: 'Nguyen Van An' },
    ],
  },
  {
    id: 'p-005',
    title: 'Computer Vision for Automated Lab Safety Monitoring',
    status: 'SUBMITTED',
    researchField: 'Computer Vision',
    budget: 55000000,
    submittedAt: '2025-03-10T10:00:00Z',
    updatedAt: '2025-03-10T10:00:00Z',
    team: [
      { id: 'u-001', name: 'Nguyen Van An' },
      { id: 'u-006', name: 'Vu Thi Phuong' },
    ],
  },
];

const MOCK_PROPOSAL_DETAIL: Proposal = {
  id: 'p-001',
  title: 'AI-Powered Student Performance Prediction System',
  abstract:
    'This research proposes an intelligent system leveraging machine learning algorithms to predict student academic performance, enabling early intervention strategies for at-risk students. The system will analyze historical data, attendance, and engagement metrics.',
  researchField: 'Artificial Intelligence',
  status: 'UNDER_REVIEW',
  createdAt: '2025-01-10T08:00:00Z',
  updatedAt: '2025-01-20T10:30:00Z',
  submittedAt: '2025-01-15T08:00:00Z',
  startDate: '2025-04-01',
  endDate: '2025-10-31',
  budget: 45000000,
  budgetItems: [
    { id: 'b-001', category: 'PERSONNEL', description: 'Research team compensation', amount: 25000000 },
    { id: 'b-002', category: 'EQUIPMENT', description: 'GPU server rental', amount: 12000000 },
    { id: 'b-003', category: 'OVERHEAD', description: 'Administrative costs', amount: 8000000 },
  ],
  team: [
    { id: 'u-001', name: 'Nguyen Van An', email: 'faculty@fpt.edu.vn', role: 'PI', department: 'Software Engineering' },
    { id: 'u-003', name: 'Le Van Cuong', email: 'cuong@fpt.edu.vn', role: 'CO_PI', department: 'AI & Data Science' },
  ],
  objectives: 'Develop a predictive model with >85% accuracy. Build an early warning dashboard for faculty. Validate with 2 academic semesters of data.',
  methodology: 'We will use supervised learning with XGBoost and LSTM neural networks trained on anonymized student data. Feature engineering will include GPA trends, attendance, and LMS engagement metrics.',
  expectedOutcomes: 'Published paper in an SCOPUS-indexed journal. Deployed system integrated with FPT University LMS.',
  statusHistory: [
    { status: 'DRAFT', timestamp: '2025-01-10T08:00:00Z' },
    { status: 'SUBMITTED', timestamp: '2025-01-15T08:00:00Z', actorName: 'Nguyen Van An' },
    { status: 'UNDER_REVIEW', timestamp: '2025-01-18T09:00:00Z', actorName: 'Admin' },
  ],
  reviews: [],
  ownerId: 'u-001',
  ownerName: 'Nguyen Van An',
};

const mockProposalService: ProposalService = {
  async getProposals(filters) {
    await delay(400);
    let results = [...MOCK_PROPOSALS];

    if (filters?.status) {
      results = results.filter((p) => p.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.researchField.toLowerCase().includes(q),
      );
    }

    return results;
  },

  async getProposalById(_id) {
    await delay(350);
    return MOCK_PROPOSAL_DETAIL;
  },

  async getProposalStats() {
    await delay(300);
    return {
      total: MOCK_PROPOSALS.length,
      draft: MOCK_PROPOSALS.filter((p) => p.status === 'DRAFT').length,
      submitted: MOCK_PROPOSALS.filter((p) => p.status === 'SUBMITTED').length,
      underReview: MOCK_PROPOSALS.filter((p) => p.status === 'UNDER_REVIEW').length,
      approved: MOCK_PROPOSALS.filter((p) => p.status === 'APPROVED').length,
      rejected: MOCK_PROPOSALS.filter((p) => p.status === 'REJECTED').length,
      revisionRequired: MOCK_PROPOSALS.filter((p) => p.status === 'REVISION_REQUIRED').length,
    };
  },

  async createProposal(data) {
    await delay(600);
    return {
      ...MOCK_PROPOSAL_DETAIL,
      id: `p-${Date.now()}`,
      title: data.title,
      abstract: data.abstract,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: undefined,
      statusHistory: [{ status: 'DRAFT', timestamp: new Date().toISOString() }],
      reviews: [],
    };
  },

  async updateProposal(_id, _data) {
    await delay(400);
    return { ...MOCK_PROPOSAL_DETAIL, updatedAt: new Date().toISOString() };
  },

  async submitProposal(_id) {
    await delay(500);
    return {
      ...MOCK_PROPOSAL_DETAIL,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  async deleteProposal(_id) {
    await delay(300);
  },
};

export const proposalService: ProposalService = mockProposalService;
