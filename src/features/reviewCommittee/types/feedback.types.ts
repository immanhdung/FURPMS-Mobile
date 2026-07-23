/** Read-only in the mobile app, mirrors web's mostly-legacy feedback view. */
export interface FeedbackResponse {
  id: string;
  councilId: string;
  reviewerId?: string | null;
  reviewerName?: string | null;
  score?: number | null;
  comments?: string | null;
  createdAt?: string | null;
}
