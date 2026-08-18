export interface FeedbackResponse {
  id: string;
  councilId: string;
  reviewerMemberId?: string | null;
  reviewerName?: string | null;
  score?: number | null;
  comments?: string | null;
  createdAt?: string | null;
}
