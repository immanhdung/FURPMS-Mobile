export interface Amendment { id: string; categoryId: number; categoryName?: string | null; changeDescription: string; justification: string; status: string; requestedAt: string; reviewerComments?: string | null; }
export interface AmendmentCategory { id: number; code: string; name: string; }
export interface CreateAmendmentPayload { categoryId: number; changeDescription: string; justification: string; oldValue?: string; newValue?: string; requiresRectorApproval: boolean; }
