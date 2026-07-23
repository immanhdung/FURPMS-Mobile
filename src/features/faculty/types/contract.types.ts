export interface Contract {
  id: string;
  proposalId: string;
  contractNumber?: string | null;
  scopeTitle?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
}
