import { httpClient } from '@/services/http.client';
import type {
  Proposal,
  ProposalSummary,
  ProposalStats,
  CreateProposalDTO,
  ProposalFilters,
} from '../types/proposal.types';

export interface ProposalService {
  getProposals(filters?: ProposalFilters): Promise<ProposalSummary[]>;
  getProposalById(id: string): Promise<Proposal>;
  getProposalStats(): Promise<ProposalStats>;
  createProposal(data: CreateProposalDTO): Promise<Proposal>;
  updateProposal(id: string, data: Partial<CreateProposalDTO>): Promise<Proposal>;
  submitProposal(id: string): Promise<Proposal>;
  deleteProposal(id: string): Promise<void>;
}

const realProposalService: ProposalService = {
  async getProposals(filters) {
    const { data } = await httpClient.get<ProposalSummary[]>('/proposals', {
      params: filters,
    });
    return data;
  },

  async getProposalById(id) {
    const { data } = await httpClient.get<Proposal>(`/proposals/${id}`);
    return data;
  },

  async getProposalStats() {
    const { data } = await httpClient.get<ProposalStats>('/proposals/stats');
    return data;
  },

  async createProposal(payload) {
    const { data } = await httpClient.post<Proposal>('/proposals', payload);
    return data;
  },

  async updateProposal(id, payload) {
    const { data } = await httpClient.put<Proposal>(`/proposals/${id}`, payload);
    return data;
  },

  async submitProposal(id) {
    const { data } = await httpClient.post<Proposal>(`/proposals/${id}/submit`);
    return data;
  },

  async deleteProposal(id) {
    await httpClient.delete(`/proposals/${id}`);
  },
};

export const proposalService: ProposalService = realProposalService;
