// Every field below is optional except titleEN/abstractEN — Gemini fills in whatever it finds in
// the uploaded document and leaves the rest unset, so the PI's form field stays blank for those.
export interface AiExtractionResult {
  titleVi?: string | null;
  titleEn?: string | null;
  abstractVi?: string | null;
  researchObjectives?: string | null;
  methodology?: string | null;
  expectedOutput?: string | null;
  durationMonths?: number | null;
  totalBudget?: number | null;
  warning?: string | null;
}

export interface SemanticSearchResult { id: string; title: string; snippet: string; relevance: number; type: 'proposal' | 'topic'; }
export interface ProposalSummaryAi { summaryText: string; editedText?: string | null; title?: string | null; strengths?: string[] | null; weaknesses?: string[] | null; generatedAt?: string | null; }
