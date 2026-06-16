export type SearchResultType = 'PROPOSAL' | 'PERSON' | 'MEETING';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  metadata?: string;
  status?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}
