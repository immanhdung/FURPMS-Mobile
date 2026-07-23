export interface ProposalDocument {
  id: string;
  fileName: string;
  documentType?: string | null;
  fileSizeBytes: number;
  uploadedAt: string;
  downloadUrl?: string | null;
}

export const DOCUMENT_TYPES = ['Thuyết minh', 'Lý lịch khoa học', 'Khác'] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];
