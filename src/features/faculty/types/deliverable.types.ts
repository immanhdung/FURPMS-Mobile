export interface Deliverable {
  id: number;
  projectId: string;
  contractId?: string | null;
  productName: string;
  description?: string | null;
  dueDate?: string | null;
  acceptanceStatus?: string | null;
  submittedAt?: string | null;
  fileUrl?: string | null;
  trialEvidenceUrl?: string | null;
  qualityAssessment?: string | null;
}

export interface SubmitDeliverablePayload {
  fileUrl: string;
  trialEvidenceUrl?: string;
  description?: string;
}
