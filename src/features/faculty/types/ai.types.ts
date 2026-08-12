// Every field below is optional except titleEN/abstractEN — Gemini fills in whatever it finds in
// the uploaded document and leaves the rest unset, so the PI's form field stays blank for those.
export interface AiExtractionResult {
  titleEN: string;
  titleVI?: string | null;
  abstractEN: string;
  keywords: string[];
  researchArea: string;
  objectives?: string | null;
  methodology?: string | null;
  expectedOutput?: string | null;
  urgency?: string | null;
  novelty?: string | null;
  applicationPotential?: string | null;
  transferPotential?: string | null;
  facilities?: string | null;
}

export interface SemanticSearchResult { id: string; title: string; snippet: string; relevance: number; type: 'proposal' | 'topic'; }
