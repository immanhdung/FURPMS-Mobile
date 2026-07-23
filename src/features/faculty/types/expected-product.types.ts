export interface ExpectedProduct {
  id: string;
  proposalId: string;
  categoryId?: number | null;
  productName: string;
  scientificRequirements?: string | null;
  notes?: string | null;
  sequence?: number | null;
}

export interface ExpectedProductPayload {
  productName: string;
  scientificRequirements?: string;
  notes?: string;
  sequence?: number;
}
