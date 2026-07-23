export interface AiExtractionResult {
  titleEN: string;
  titleVI?: string | null;
  abstractEN: string;
  keywords: string[];
  researchArea: string;
}

export interface SimilarityCheckResult {
  score: number;
  passed: boolean;
}
