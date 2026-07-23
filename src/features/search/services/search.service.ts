import { httpClient } from '@/services/http.client';
import type { SearchResponse } from '../types/search.types';

export interface SearchService {
  search(query: string): Promise<SearchResponse>;
}

const realSearchService: SearchService = {
  async search(query) {
    const { data } = await httpClient.get<SearchResponse>('/search', {
      params: { q: query, limit: 20 },
    });
    return data;
  },
};

export const searchService: SearchService = realSearchService;
